-- Pack 3: durable organization-owned audience organization.

create table public.contact_tags (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  public_id text not null default ('tag_' || replace(gen_random_uuid()::text, '-', '')) unique,
  name text not null check (length(btrim(name)) between 1 and 60),
  normalized_name text generated always as (lower(regexp_replace(btrim(name), '\s+', ' ', 'g'))) stored,
  created_by_membership_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  unique (organization_id, normalized_name),
  foreign key (created_by_membership_id, organization_id)
    references public.organization_memberships(id, organization_id) on delete restrict
);

create table public.contact_lists (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  public_id text not null default ('list_' || replace(gen_random_uuid()::text, '-', '')) unique,
  name text not null check (length(btrim(name)) between 1 and 100),
  normalized_name text generated always as (lower(regexp_replace(btrim(name), '\s+', ' ', 'g'))) stored,
  description text check (description is null or length(description) <= 500),
  created_by_membership_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  unique (organization_id, normalized_name),
  foreign key (created_by_membership_id, organization_id)
    references public.organization_memberships(id, organization_id) on delete restrict
);

create table public.contact_tag_memberships (
  organization_id uuid not null references public.organizations(id) on delete restrict,
  contact_id uuid not null,
  tag_id uuid not null,
  added_by_membership_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (contact_id, tag_id),
  foreign key (contact_id, organization_id) references public.contacts(id, organization_id) on delete cascade,
  foreign key (tag_id, organization_id) references public.contact_tags(id, organization_id) on delete cascade,
  foreign key (added_by_membership_id, organization_id) references public.organization_memberships(id, organization_id) on delete restrict
);

create table public.contact_list_memberships (
  organization_id uuid not null references public.organizations(id) on delete restrict,
  contact_id uuid not null,
  list_id uuid not null,
  added_by_membership_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (contact_id, list_id),
  foreign key (contact_id, organization_id) references public.contacts(id, organization_id) on delete cascade,
  foreign key (list_id, organization_id) references public.contact_lists(id, organization_id) on delete cascade,
  foreign key (added_by_membership_id, organization_id) references public.organization_memberships(id, organization_id) on delete restrict
);

create index contact_tag_memberships_filter_idx on public.contact_tag_memberships(organization_id, tag_id, contact_id);
create index contact_list_memberships_filter_idx on public.contact_list_memberships(organization_id, list_id, contact_id);
create index contact_lists_name_idx on public.contact_lists(organization_id, normalized_name);
create index contacts_email_permission_idx on public.contacts(organization_id, marketing_email_status, updated_at desc) where archived_at is null;
create index contacts_sms_permission_idx on public.contacts(organization_id, marketing_sms_status, updated_at desc) where archived_at is null;

create trigger contact_tags_set_updated_at before update on public.contact_tags
for each row execute function public.set_updated_at();
create trigger contact_lists_set_updated_at before update on public.contact_lists
for each row execute function public.set_updated_at();

alter table public.contact_tags enable row level security;
alter table public.contact_lists enable row level security;
alter table public.contact_tag_memberships enable row level security;
alter table public.contact_list_memberships enable row level security;

create policy contact_tags_select on public.contact_tags for select to authenticated
using (public.current_active_membership_id(organization_id) is not null);
create policy contact_tags_insert on public.contact_tags for insert to authenticated
with check (created_by_membership_id = public.current_active_membership_id(organization_id));
create policy contact_tags_update on public.contact_tags for update to authenticated
using (public.current_active_membership_id(organization_id) is not null)
with check (public.current_active_membership_id(organization_id) is not null);

create policy contact_lists_select on public.contact_lists for select to authenticated
using (public.current_active_membership_id(organization_id) is not null);
create policy contact_lists_insert on public.contact_lists for insert to authenticated
with check (created_by_membership_id = public.current_active_membership_id(organization_id));
create policy contact_lists_update on public.contact_lists for update to authenticated
using (public.current_active_membership_id(organization_id) is not null)
with check (public.current_active_membership_id(organization_id) is not null);

create policy contact_tag_memberships_select on public.contact_tag_memberships for select to authenticated
using (public.current_active_membership_id(organization_id) is not null);
create policy contact_tag_memberships_insert on public.contact_tag_memberships for insert to authenticated
with check (added_by_membership_id = public.current_active_membership_id(organization_id));
create policy contact_tag_memberships_delete on public.contact_tag_memberships for delete to authenticated
using (public.current_active_membership_id(organization_id) is not null);
create policy contact_list_memberships_select on public.contact_list_memberships for select to authenticated
using (public.current_active_membership_id(organization_id) is not null);
create policy contact_list_memberships_insert on public.contact_list_memberships for insert to authenticated
with check (added_by_membership_id = public.current_active_membership_id(organization_id));
create policy contact_list_memberships_delete on public.contact_list_memberships for delete to authenticated
using (public.current_active_membership_id(organization_id) is not null);

revoke all on public.contact_tags, public.contact_lists, public.contact_tag_memberships, public.contact_list_memberships from anon;
grant select, insert, update on public.contact_tags, public.contact_lists to authenticated;
grant select, insert, delete on public.contact_tag_memberships, public.contact_list_memberships to authenticated;

create function public.bulk_organize_contacts(
  target_contact_public_ids text[], operation text, target_public_id text default null,
  target_lifecycle public.contact_lifecycle_status default null
) returns integer language plpgsql security definer set search_path = '' as $$
declare actor uuid; org uuid; affected integer;
begin
  if auth.uid() is null or coalesce(array_length(target_contact_public_ids, 1), 0) < 1
    or array_length(target_contact_public_ids, 1) > 50 then
    raise exception using errcode='42501', message='An authenticated bounded selection is required.';
  end if;
  select c.organization_id into org from public.contacts c
    where c.public_id = target_contact_public_ids[1] and public.can_view_membership(c.assigned_membership_id);
  actor := public.current_active_membership_id(org);
  if actor is null or exists (
    select 1 from unnest(target_contact_public_ids) p
    left join public.contacts c on c.public_id=p and c.organization_id=org and c.archived_at is null
      and public.can_view_membership(c.assigned_membership_id) where c.id is null
  ) then raise exception using errcode='42501', message='Contact access is required.'; end if;
  if operation = 'add-tag' then
    insert into public.contact_tag_memberships(organization_id,contact_id,tag_id,added_by_membership_id)
    select org,c.id,t.id,actor from public.contacts c join public.contact_tags t on t.public_id=target_public_id and t.organization_id=org
    where c.public_id=any(target_contact_public_ids) on conflict do nothing;
  elsif operation = 'remove-tag' then
    delete from public.contact_tag_memberships m using public.contacts c, public.contact_tags t
    where m.contact_id=c.id and m.tag_id=t.id and c.public_id=any(target_contact_public_ids) and t.public_id=target_public_id and m.organization_id=org;
  elsif operation = 'add-list' then
    insert into public.contact_list_memberships(organization_id,contact_id,list_id,added_by_membership_id)
    select org,c.id,l.id,actor from public.contacts c join public.contact_lists l on l.public_id=target_public_id and l.organization_id=org
    where c.public_id=any(target_contact_public_ids) on conflict do nothing;
  elsif operation = 'remove-list' then
    delete from public.contact_list_memberships m using public.contacts c, public.contact_lists l
    where m.contact_id=c.id and m.list_id=l.id and c.public_id=any(target_contact_public_ids) and l.public_id=target_public_id and m.organization_id=org;
  elsif operation = 'lifecycle' and target_lifecycle <> 'active-candidate' then
    update public.contacts set lifecycle_status=target_lifecycle where organization_id=org and public_id=any(target_contact_public_ids);
  else raise exception using errcode='22023', message='Unsupported bulk operation.'; end if;
  get diagnostics affected = row_count; return affected;
end; $$;
revoke all on function public.bulk_organize_contacts(text[],text,text,public.contact_lifecycle_status) from public,anon;
grant execute on function public.bulk_organize_contacts(text[],text,text,public.contact_lifecycle_status) to authenticated;

comment on table public.contact_tags is 'Organization-owned reusable classifications for permanent Contacts.';
comment on table public.contact_lists is 'Organization-owned explicitly maintained groups of Contacts.';
comment on function public.bulk_organize_contacts is 'Authorization-checked current-page bulk organization, bounded to 50 Contacts.';
