-- Tenant media. Only the authenticated server upload boundary writes objects/metadata.
create table public.studio_media_assets (
 public_id text primary key check(public_id ~ '^asset_[a-f0-9]{32}$'), organization_id uuid not null references public.organizations(id), creator_membership_id uuid not null,
 version integer not null default 1 check(version=1), source_mime text not null check(source_mime in ('image/jpeg','image/png','image/webp')), output_mime text not null check(output_mime='image/png'),
 width integer not null check(width between 1 and 1200), height integer not null check(height between 1 and 1200), byte_size integer not null check(byte_size>0), source_byte_size integer not null check(source_byte_size between 1 and 3145728), checksum text not null check(checksum ~ '^[a-f0-9]{64}$'), source_checksum text not null check(source_checksum ~ '^[a-f0-9]{64}$'),
 source_path text not null unique, delivery_path text not null unique, thumbnail_path text not null unique, default_alt text not null default '' check(length(default_alt)<=300), status text not null default 'ready' check(status in ('ready','archived')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(public_id,organization_id),
 foreign key(creator_membership_id,organization_id) references public.organization_memberships(id,organization_id),
 check(source_path=organization_id::text||'/'||public_id||'/1/original'), check(delivery_path=organization_id::text||'/'||public_id||'/1/email.png'), check(thumbnail_path=organization_id::text||'/'||public_id||'/1/thumb.png')
);
create index studio_media_tenant on public.studio_media_assets(organization_id,created_at desc);
alter table public.studio_media_assets enable row level security;
revoke all on public.studio_media_assets from anon,authenticated;
grant select on public.studio_media_assets to authenticated;
grant select,insert on public.studio_media_assets to service_role;
create policy studio_media_read on public.studio_media_assets for select to authenticated using(public.current_active_membership_id(organization_id) is not null);
create function private.studio_media_immutable() returns trigger language plpgsql security definer set search_path='' as $fn$
begin
 if tg_op='DELETE' then raise exception 'Archive media; published versions cannot be deleted.'; end if;
 if tg_op='UPDATE' and (to_jsonb(new)-'status'-'updated_at') is distinct from (to_jsonb(old)-'status'-'updated_at') then raise exception 'Media versions are immutable.'; end if;
 if tg_op='INSERT' and not exists(select 1 from public.organization_memberships where id=new.creator_membership_id and organization_id=new.organization_id and status='active') then raise exception 'Active creator required.'; end if;
 new.updated_at=clock_timestamp(); return new;
end $fn$;
create trigger studio_media_immutable before insert or update or delete on public.studio_media_assets for each row execute function private.studio_media_immutable();
revoke all on function private.studio_media_immutable() from public,anon,authenticated;

create table public.studio_organization_branding (
 organization_id uuid primary key references public.organizations(id), logo_asset_id text, postal_address text not null default '' check(length(postal_address)<=500),
 primary_color text not null default '#172033' check(primary_color in ('#172033','#475569','#2563EB','#047857','#9F1239','#7C3AED')),
 accent_color text not null default '#2563EB' check(accent_color in ('#172033','#475569','#2563EB','#047857','#9F1239','#7C3AED')),
 default_font text not null default 'arial' check(default_font in ('arial','verdana','tahoma','trebuchet','georgia','times')),
 updated_at timestamptz not null default now(), foreign key(logo_asset_id,organization_id) references public.studio_media_assets(public_id,organization_id)
);
create table public.studio_consultant_branding (
 membership_id uuid primary key,organization_id uuid not null,headshot_asset_id text,updated_at timestamptz not null default now(),
 foreign key(membership_id,organization_id) references public.organization_memberships(id,organization_id), foreign key(headshot_asset_id,organization_id) references public.studio_media_assets(public_id,organization_id)
);
alter table public.studio_organization_branding enable row level security;
alter table public.studio_consultant_branding enable row level security;
revoke all on public.studio_organization_branding,public.studio_consultant_branding from anon,authenticated;
grant select on public.studio_organization_branding,public.studio_consultant_branding to authenticated;
create policy studio_brand_read on public.studio_organization_branding for select to authenticated using(public.current_active_membership_id(organization_id) is not null);
create policy studio_portrait_read on public.studio_consultant_branding for select to authenticated using(public.current_active_membership_id(organization_id)=membership_id);
create function public.save_studio_branding(target_organization_id uuid, proposed jsonb, organization_changes boolean) returns void language plpgsql security definer set search_path='' as $fn$
declare m uuid;
begin
 m=public.current_active_membership_id(target_organization_id);
 if m is null then raise exception using errcode='42501',message='Active membership required.'; end if;
 if organization_changes then
 if not exists(select 1 from public.organization_memberships where id=m and role in ('owner','admin')) then raise exception using errcode='42501',message='Organization branding requires an owner or admin.'; end if;
 insert into public.studio_organization_branding(organization_id,logo_asset_id,postal_address,primary_color,accent_color,default_font) values(target_organization_id,proposed->>'logo',proposed->>'postalAddress',proposed->>'primaryColor',proposed->>'accentColor',proposed->>'font') on conflict(organization_id) do update set logo_asset_id=excluded.logo_asset_id,postal_address=excluded.postal_address,primary_color=excluded.primary_color,accent_color=excluded.accent_color,default_font=excluded.default_font,updated_at=clock_timestamp();
 else
 insert into public.studio_consultant_branding(membership_id,organization_id,headshot_asset_id) values(m,target_organization_id,proposed->>'headshot') on conflict(membership_id) do update set headshot_asset_id=excluded.headshot_asset_id,updated_at=clock_timestamp();
 end if;
end $fn$;
revoke all on function public.save_studio_branding(uuid,jsonb,boolean) from public,anon;
grant execute on function public.save_studio_branding(uuid,jsonb,boolean) to authenticated;

alter table public.marketing_campaigns add column branding_snapshot jsonb;
-- Owned snapshot schema is appended below. Existing rows remain NULL, with no UPDATE.
create function private.studio_campaign_assets() returns trigger language plpgsql set search_path='' as $fn$
declare asset text;
begin
 if new.content_version=2 then
 for asset in select jsonb_path_query(new.content,'$.document.content.**.assetId') #>> '{}' union select new.branding_snapshot->>'logo' union select new.branding_snapshot->>'headshot' loop
 if asset is not null and not exists(select 1 from public.studio_media_assets where public_id=asset and organization_id=new.organization_id and status in ('ready','archived')) then raise exception using errcode='42501',message='Image is unavailable in this workspace.'; end if;
 end loop;
 end if;
 return new;
end $fn$;
create trigger studio_campaign_assets before insert or update on public.marketing_campaigns for each row execute function private.studio_campaign_assets();
revoke all on function private.studio_campaign_assets() from public,anon,authenticated;
-- Source downloads are authorized by exact durable metadata, never by a path prefix.
create policy studio_source_read on storage.objects for select to authenticated using(bucket_id='studio-originals' and exists(select 1 from public.studio_media_assets a where a.source_path=name and public.current_active_membership_id(a.organization_id) is not null));
-- No client INSERT, UPDATE, DELETE or public-list policy is granted for either bucket.

create or replace function public.save_marketing_campaign_draft(target_organization_id uuid,target_public_id text,expected_updated_at timestamptz,payload jsonb)
returns public.marketing_campaigns language plpgsql security definer set search_path='' as $fn$
declare m uuid; c public.marketing_campaigns;
begin
 m:=public.current_active_membership_id(target_organization_id);
 if m is null then raise exception using errcode='42501',message='Campaign unavailable.'; end if;
 if payload->>'status' not in ('draft','ready') or payload->>'status' is null then raise exception using errcode='22023',message='Invalid draft status.'; end if;
 if coalesce(target_public_id,'')<>'' then
 select * into c from public.marketing_campaigns where organization_id=target_organization_id and public_id=target_public_id for update;
 if c.id is null or c.created_by_membership_id<>m or c.status in ('sent','sending') then raise exception using errcode='42501',message='Campaign is read-only or unavailable.'; end if;
 if expected_updated_at is null or c.updated_at<>expected_updated_at then raise exception using errcode='40001',message='Stale campaign revision.'; end if;
 update public.marketing_campaigns set name=payload->>'name',description=payload->>'description',subject=payload->>'subject',preview_text=payload->>'preview_text',sender_name=payload->>'sender_name',reply_to=payload->>'reply_to',audience_type=(payload->>'audience_type')::public.marketing_audience_source,audience_public_id=payload->>'audience_public_id',content_version=(payload->>'content_version')::integer,content=payload->'content',branding_snapshot=nullif(payload->'branding_snapshot','null'::jsonb),status=(payload->>'status')::public.marketing_campaign_status where id=c.id returning * into c;
 else
 insert into public.marketing_campaigns(organization_id,created_by_membership_id,name,description,subject,preview_text,sender_name,reply_to,audience_type,audience_public_id,content_version,content,branding_snapshot,status)
 values(target_organization_id,m,payload->>'name',payload->>'description',payload->>'subject',payload->>'preview_text',payload->>'sender_name',payload->>'reply_to',(payload->>'audience_type')::public.marketing_audience_source,payload->>'audience_public_id',(payload->>'content_version')::integer,payload->'content',nullif(payload->'branding_snapshot','null'::jsonb),(payload->>'status')::public.marketing_campaign_status) returning * into c;
 end if;
 return c;
end $fn$;
revoke all on function public.save_marketing_campaign_draft(uuid,text,timestamptz,jsonb) from public,anon;
grant execute on function public.save_marketing_campaign_draft(uuid,text,timestamptz,jsonb) to authenticated;

alter table public.marketing_campaigns add constraint studio_branding_snapshot_valid check (branding_snapshot is null or extensions.jsonb_matches_schema($schema${"$schema":"https://json-schema.org/draft/2020-12/schema","type":"object","properties":{"version":{"type":"number","const":1},"company":{"type":"string","maxLength":200},"website":{"anyOf":[{"type":"string","const":""},{"type":"string","maxLength":500,"pattern":"^https:\\/\\/[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?(?::[0-9]{1,5})?(?:[/?#][^\\s<>\"'\\\\]*)?$"}]},"postalAddress":{"type":"string","maxLength":500},"primaryColor":{"type":"string","enum":["#172033","#475569","#2563EB","#047857","#9F1239","#7C3AED"]},"accentColor":{"type":"string","enum":["#172033","#475569","#2563EB","#047857","#9F1239","#7C3AED"]},"font":{"type":"string","enum":["arial","verdana","tahoma","trebuchet","georgia","times"]},"logo":{"anyOf":[{"type":"string","pattern":"^asset_[a-f0-9]{32}$"},{"type":"null"}]},"headshot":{"anyOf":[{"type":"string","pattern":"^asset_[a-f0-9]{32}$"},{"type":"null"}]},"name":{"type":"string","maxLength":120},"title":{"type":"string","maxLength":160},"email":{"type":"string","maxLength":254},"phone":{"type":"string","maxLength":40},"linkedIn":{"anyOf":[{"type":"string","const":""},{"type":"string","maxLength":500,"pattern":"^https:\\/\\/[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?(?::[0-9]{1,5})?(?:[/?#][^\\s<>\"'\\\\]*)?$"}]},"scheduling":{"anyOf":[{"type":"string","const":""},{"type":"string","maxLength":500,"pattern":"^https:\\/\\/[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?(?::[0-9]{1,5})?(?:[/?#][^\\s<>\"'\\\\]*)?$"}]}},"required":["version","company","website","postalAddress","primaryColor","accentColor","font","logo","headshot","name","title","email","phone","linkedIn","scheduling"],"additionalProperties":false}$schema$::json,branding_snapshot));
