-- Platform-owned intelligence. No demo data and no runtime composition changes.
create table public.brand_identities (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique default ('brand_' || replace(gen_random_uuid()::text, '-', '')),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(btrim(name)) between 1 and 200),
  lifecycle text not null default 'active' check (lifecycle in ('active','inactive','concept','unknown')),
  visibility text not null default 'restricted' check (visibility in ('shared','restricted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brand_public_id_format check (public_id ~ '^brand_[a-z0-9]{16,64}$')
);

create table public.brand_profile_versions (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brand_identities(id) on delete restrict,
  version_number integer not null check (version_number > 0),
  based_on_profile_id uuid,
  status text not null default 'draft' check (status in ('draft','reviewed','published')),
  brand_name text not null check (length(btrim(brand_name)) between 1 and 200),
  origin text not null check (length(btrim(origin)) between 1 and 200),
  created_by text not null check (length(btrim(created_by)) between 1 and 200),
  reviewed_by text,
  reviewed_at timestamptz,
  effective_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_id, version_number),
  unique (id, brand_id),
  foreign key (based_on_profile_id, brand_id) references public.brand_profile_versions(id, brand_id) on delete restrict,
  check (based_on_profile_id is distinct from id),
  check ((status = 'draft' and reviewed_by is null and reviewed_at is null and published_at is null)
    or (status = 'reviewed' and length(btrim(reviewed_by)) > 0 and reviewed_at is not null and published_at is null)
    or (status = 'published' and length(btrim(reviewed_by)) > 0 and reviewed_at is not null and published_at is not null and effective_at is not null)),
  check (status = 'draft' or reviewed_by is not null)
);
-- Current means highest published version_number, never an editable historical flag.
create index brand_profiles_current_idx on public.brand_profile_versions(brand_id, version_number desc) where status = 'published';
create index brand_profiles_basis_idx on public.brand_profile_versions(based_on_profile_id);

create table public.brand_fact_definitions (
  fact_key text primary key check (fact_key ~ '^[a-zA-Z]+(\.[a-zA-Z]+)*$'),
  value_kind text not null check (value_kind in ('text','number','boolean','text-list','enum','enum-list','money-range','fees')),
  allowed_values text[],
  check ((value_kind in ('enum','enum-list') and cardinality(allowed_values) > 0 and allowed_values is not null)
    or (value_kind not in ('enum','enum-list') and allowed_values is null))
);

insert into public.brand_fact_definitions(fact_key,value_kind,allowed_values) values
('category','text',null),('industry','text',null),('description','text',null),('website','text',null),('franchisor','text',null),
('economics.franchiseFee','number',null),('economics.initialInvestment','money-range',null),
('economics.minimumLiquidCapital','number',null),('economics.minimumNetWorth','number',null),
('economics.royalty','text',null),('economics.marketingFund','text',null),('economics.otherRecurringFees','fees',null),
('characteristics.customerModel','enum',array['B2B','B2C','mixed']),
('characteristics.businessType','enum',array['service','retail','food','professional','other']),
('characteristics.operatingLocations','enum-list',array['home-based','office','retail','mobile','flexible','unknown']),
('characteristics.ownerOperatorSuitability','enum',array['not-suited','possible','well-suited','unknown']),
('characteristics.semiAbsenteeSuitability','enum',array['not-suited','possible','well-suited','unknown']),
('characteristics.executiveSuitability','enum',array['not-suited','possible','well-suited','unknown']),
('characteristics.staffingIntensity','enum',array['low','moderate','high','very-high']),
('characteristics.salesIntensity','enum',array['low','moderate','high','very-high']),
('characteristics.operationalComplexity','enum',array['low','moderate','high','very-high']),
('characteristics.customerAcquisitionModel','text',null),('characteristics.recurringRevenue','boolean',null),
('characteristics.locationDependence','enum',array['low','moderate','high','very-high']),('characteristics.territoryModel','text',null),
('fit.leadership','enum',array['low','moderate','high','very-high']),('fit.salesComfort','enum',array['low','moderate','high','very-high']),
('fit.networkingBusinessDevelopment','enum',array['low','moderate','high','very-high']),('fit.operationalManagement','enum',array['low','moderate','high','very-high']),
('fit.peopleManagement','enum',array['low','moderate','high','very-high']),('fit.analyticalAptitude','enum',array['low','moderate','high','very-high']),
('fit.relationshipBuilding','enum',array['low','moderate','high','very-high']),('fit.communityOrientation','enum',array['low','moderate','high','very-high']),
('fit.desiredLifestyle','text',null),('fit.timeCommitment','text',null),('fit.financialSuitability','text',null),('fit.priorIndustryExperience','text',null),
('support.initialTraining','text',null),('support.ongoingSupport','text',null),('support.marketingSupport','text',null),
('support.salesSupport','text',null),('support.technologySupport','text',null),('support.fieldSupport','text',null),
('system.approximateSize','text',null),('system.unitMix','text',null),('system.geography','text',null),('system.maturity','text',null),
('differentiators','text-list',null),('considerations','text-list',null),('discoveryQuestions','text-list',null);

create table public.brand_profile_facts (
  profile_id uuid not null references public.brand_profile_versions(id) on delete restrict,
  fact_key text not null references public.brand_fact_definitions(fact_key) on delete restrict,
  value jsonb,
  knowledge_state text not null default 'unknown' check (knowledge_state in ('unknown','known')),
  review_state text not null default 'not-reviewed' check (review_state in ('not-reviewed','reviewed')),
  verification text not null default 'unknown' check (verification in ('unknown','unverified','reviewed','verified','conflicting')),
  confidence text check (confidence in ('high','medium','low')),
  approval text not null default 'unavailable' check (approval in ('approved-for-presentation','internal-only','needs-review','unavailable')),
  notes text,
  primary key (profile_id,fact_key),
  check ((knowledge_state='unknown' and value is null and verification='unknown' and approval='unavailable')
    or (knowledge_state='known' and value is not null and value <> 'null'::jsonb and verification <> 'unknown')),
  check (verification not in ('verified','reviewed') or review_state='reviewed')
);
create index brand_facts_key_idx on public.brand_profile_facts(fact_key);

-- Immutable from insertion: correcting/reviewing a source creates a new snapshot.
create table public.brand_evidence (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brand_identities(id) on delete restrict,
  supersedes_id uuid,
  source_type text not null check (source_type in ('primary','secondary','consultant-provided','inferred','legacy-demo')),
  title text not null check (length(btrim(title)) between 1 and 500),
  source_date date,
  retrieved_at timestamptz,
  reviewed_at timestamptz,
  source_url text,
  document_reference text,
  fdd_item text,
  page_reference text,
  verification text not null default 'unverified' check (verification in ('unverified','reviewed','verified','conflicting')),
  confidence text check (confidence in ('high','medium','low')),
  notes text,
  created_by text not null check (length(btrim(created_by)) between 1 and 200),
  created_at timestamptz not null default now(),
  unique (id,brand_id),
  foreign key (supersedes_id,brand_id) references public.brand_evidence(id,brand_id) on delete restrict,
  check (supersedes_id is distinct from id),
  check (verification not in ('reviewed','verified') or reviewed_at is not null)
);
create index brand_evidence_brand_idx on public.brand_evidence(brand_id);
create index brand_evidence_supersedes_idx on public.brand_evidence(supersedes_id);

create table public.brand_fact_evidence (
  profile_id uuid not null,
  fact_key text not null,
  evidence_id uuid not null,
  brand_id uuid not null,
  position integer not null default 0 check (position >= 0),
  is_primary boolean not null default false,
  primary key(profile_id,fact_key,evidence_id),
  foreign key(profile_id,fact_key) references public.brand_profile_facts(profile_id,fact_key) on delete restrict,
  foreign key(profile_id,brand_id) references public.brand_profile_versions(id,brand_id) on delete restrict,
  foreign key(evidence_id,brand_id) references public.brand_evidence(id,brand_id) on delete restrict
);
create unique index brand_fact_primary_evidence_idx on public.brand_fact_evidence(profile_id,fact_key) where is_primary;
create index brand_fact_evidence_source_idx on public.brand_fact_evidence(evidence_id,brand_id);

-- Optional platform editorial items. Replacements travel in a new profile version.
create table public.brand_consultant_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.brand_profile_versions(id) on delete restrict,
  section text not null check (section in ('businessSummary','franchiseeRole','strongFit','potentialFriction','diligenceGap','note')),
  position integer not null check (position >= 0),
  label text not null check (length(btrim(label)) between 1 and 200),
  explanation text not null check (length(btrim(explanation)) between 1 and 10000),
  source_facts text[] not null check (cardinality(source_facts)>0),
  origin text not null check (origin in ('editorial','ai-assisted')),
  origin_reference text not null check (length(btrim(origin_reference)) between 1 and 500),
  created_by text not null check (length(btrim(created_by)) between 1 and 200),
  review_state text not null default 'not-reviewed' check (review_state in ('not-reviewed','reviewed')),
  reviewed_by text,
  reviewed_at timestamptz,
  approval text not null default 'needs-review' check (approval in ('approved-for-presentation','internal-only','needs-review')),
  created_at timestamptz not null default now(),
  unique(profile_id,section,position),
  check (review_state <> 'reviewed' or (reviewed_by is not null and length(btrim(reviewed_by))>0 and reviewed_at is not null)),
  check (approval <> 'approved-for-presentation' or review_state='reviewed')
);

-- Provisioned by the platform, never self-granted by tenant members.
create table public.organization_brands (
  organization_id uuid not null references public.organizations(id) on delete restrict,
  brand_id uuid not null references public.brand_identities(id) on delete restrict,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(organization_id,brand_id)
);
create index organization_brands_brand_idx on public.organization_brands(brand_id,organization_id);

create function private.brand_fact_value_valid(v jsonb, kind text, choices text[])
returns boolean language plpgsql immutable security invoker set search_path='' as $$
declare element jsonb;
begin
  if v is null then return true; end if;
  case kind
  when 'text' then return jsonb_typeof(v)='string' and length(btrim(v #>> '{}'))>0;
  when 'number' then return jsonb_typeof(v)='number' and (v #>> '{}')::numeric >= 0;
  when 'boolean' then return jsonb_typeof(v)='boolean';
  when 'enum' then return jsonb_typeof(v)='string' and (v #>> '{}')=any(choices);
  when 'text-list','enum-list' then
    if jsonb_typeof(v)<>'array' then return false; end if;
    for element in select value from jsonb_array_elements(v) loop
      if jsonb_typeof(element)<>'string' or length(btrim(element #>> '{}'))=0 then return false; end if;
      if kind='enum-list' and not (element #>> '{}')=any(choices) then return false; end if;
    end loop;
    return true;
  when 'money-range' then
    if jsonb_typeof(v)<>'object' or not v ?& array['minimum','maximum','currency']
      or v - array['minimum','maximum','currency'] <> '{}'::jsonb or v->>'currency'<>'USD' then return false; end if;
    if v->'currency' = 'null'::jsonb then return false; end if;
    foreach kind in array array['minimum','maximum'] loop
      if v->kind <> 'null'::jsonb then
        if jsonb_typeof(v->kind)<>'number' then return false; end if;
        if (v->>kind)::numeric < 0 then return false; end if;
      end if;
    end loop;
    return (v->'minimum'='null'::jsonb or v->'maximum'='null'::jsonb or (v->>'minimum')::numeric <= (v->>'maximum')::numeric);
  when 'fees' then
    if jsonb_typeof(v)<>'array' then return false; end if;
    for element in select value from jsonb_array_elements(v) loop
      if jsonb_typeof(element)<>'object' or not element ?& array['name','amount']
        or element - array['name','amount'] <> '{}'::jsonb then return false; end if;
      if jsonb_typeof(element->'name')<>'string' or jsonb_typeof(element->'amount')<>'string'
        or length(btrim(element->>'name'))=0 or length(btrim(element->>'amount'))=0 then return false; end if;
    end loop;
    return true;
  else return false;
  end case;
end $$;

create function private.brand_prevent_mutation()
returns trigger language plpgsql security invoker set search_path='' as $$
begin raise exception using errcode='23514',message='Brand history and governed definitions are immutable.'; end $$;
create trigger brand_evidence_immutable before update or delete on public.brand_evidence for each row execute function private.brand_prevent_mutation();
create trigger brand_definitions_immutable before update or delete on public.brand_fact_definitions for each row execute function private.brand_prevent_mutation();

create function private.brand_guard_profile()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if tg_op='DELETE' then
    raise exception using errcode='23514',message='Archive the brand; profile history cannot be deleted.';
  end if;
  if tg_op='INSERT' then
    if new.status<>'draft' then raise exception using errcode='23514',message='Profiles must begin as drafts.'; end if;
    if new.based_on_profile_id is not null and not exists(select 1 from public.brand_profile_versions where id=new.based_on_profile_id and status='published' and version_number<new.version_number) then
      raise exception using errcode='23514',message='A draft basis must be an earlier published profile.';
    end if;
    return new;
  end if;
  if old.status='published' then raise exception using errcode='23514',message='Published brand profiles are immutable.'; end if;
  if new.id<>old.id or new.brand_id<>old.brand_id or new.version_number<>old.version_number
    or new.based_on_profile_id is distinct from old.based_on_profile_id
    or new.created_by<>old.created_by or new.created_at<>old.created_at then
    raise exception using errcode='23514',message='Profile identity and origin linkage are immutable.';
  end if;
  if new.status='published' then
    if old.status<>'reviewed' then raise exception using errcode='23514',message='Review the profile before publishing.'; end if;
    -- Serialize publication for this brand; version ordering resolves current deterministically.
    perform 1 from public.brand_identities where id=new.brand_id for update;
    if exists(select 1 from public.brand_profile_versions where brand_id=new.brand_id and status='published' and version_number>=new.version_number) then
      raise exception using errcode='23514',message='Publish a version newer than the current published profile.';
    end if;
    if (to_jsonb(new)-array['status','published_at','updated_at']) is distinct from (to_jsonb(old)-array['status','published_at','updated_at']) then
      raise exception using errcode='23514',message='Publication cannot change reviewed metadata.';
    end if;
    new.published_at := now();
  end if;
  if new.status in ('reviewed','published') then
    if exists(select 1 from public.brand_fact_definitions d where not exists(select 1 from public.brand_profile_facts f where f.profile_id=new.id and f.fact_key=d.fact_key)) then
      raise exception using errcode='23514',message='Review requires every governed fact, including explicit unknowns.';
    end if;
    if exists(select 1 from public.brand_profile_facts where profile_id=new.id and review_state<>'reviewed')
      or exists(select 1 from public.brand_consultant_items where profile_id=new.id and review_state<>'reviewed') then
      raise exception using errcode='23514',message='Review every fact and editorial item before profile approval.';
    end if;
    if exists(select 1 from public.brand_profile_facts f where f.profile_id=new.id and f.verification='verified'
      and not exists(select 1 from public.brand_fact_evidence fe join public.brand_evidence e on e.id=fe.evidence_id
        where fe.profile_id=f.profile_id and fe.fact_key=f.fact_key and e.verification='verified')) then
      raise exception using errcode='23514',message='Verified facts require a verified evidence snapshot before approval.';
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger brand_profile_lifecycle before insert or update or delete on public.brand_profile_versions for each row execute function private.brand_guard_profile();

create function private.brand_guard_content()
returns trigger language plpgsql security invoker set search_path='' as $$
declare pid uuid; profile_status text; definition public.brand_fact_definitions; source_key text;
begin
  pid := case when tg_op='DELETE' then old.profile_id else new.profile_id end;
  if tg_op='UPDATE' and new.profile_id<>old.profile_id then
    raise exception using errcode='23514',message='Profile content cannot be moved.';
  end if;
  -- A row lock serializes content edits against review/publication.
  select status into profile_status from public.brand_profile_versions where id=pid for update;
  if profile_status is distinct from 'draft' then raise exception using errcode='23514',message='Only draft profile content may change.'; end if;
  if tg_table_name='brand_profile_facts' and tg_op in ('UPDATE','DELETE') then
    if tg_op='DELETE' or new.fact_key<>old.fact_key then
      if exists(select 1 from public.brand_consultant_items where profile_id=pid and old.fact_key=any(source_facts)) then
        raise exception using errcode='23503',message='A fact referenced by editorial intelligence cannot be removed or renamed.';
      end if;
    end if;
  end if;
  if tg_op='DELETE' then return old; end if;
  if tg_table_name='brand_profile_facts' then
    select * into definition from public.brand_fact_definitions where fact_key=new.fact_key;
    if definition.fact_key is null then raise exception using errcode='23503',message='Unrecognized brand fact key.'; end if;
    if not coalesce(private.brand_fact_value_valid(new.value,definition.value_kind,definition.allowed_values),false) then
      raise exception using errcode='23514',message='Invalid governed brand fact value.';
    end if;
  elsif tg_table_name='brand_consultant_items' then
    foreach source_key in array new.source_facts loop
      if not exists(select 1 from public.brand_profile_facts where profile_id=pid and fact_key=source_key) then
        raise exception using errcode='23503',message='Editorial sources must reference facts in this profile.';
      end if;
    end loop;
  end if;
  return new;
end $$;
create trigger brand_facts_guard before insert or update or delete on public.brand_profile_facts for each row execute function private.brand_guard_content();
create trigger brand_fact_evidence_guard before insert or update or delete on public.brand_fact_evidence for each row execute function private.brand_guard_content();
create trigger brand_consultant_items_guard before insert or update or delete on public.brand_consultant_items for each row execute function private.brand_guard_content();

create function private.brand_guard_identity()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if tg_op='DELETE' then raise exception using errcode='23514',message='Archive brand identities instead of deleting them.'; end if;
  if new.id<>old.id or new.public_id<>old.public_id or new.slug<>old.slug or new.created_at<>old.created_at then
    raise exception using errcode='23514',message='Brand identity and slug are immutable.';
  end if;
  new.updated_at:=now(); return new;
end $$;
create trigger brand_identity_guard before update or delete on public.brand_identities for each row execute function private.brand_guard_identity();
create trigger organization_brands_updated before update on public.organization_brands for each row execute function public.set_updated_at();

-- Membership checks run under existing RLS. No new SECURITY DEFINER API.
create function private.brand_has_membership()
returns boolean language sql stable security invoker set search_path='' as $$
 select auth.uid() is not null and coalesce(auth.jwt()->>'is_anonymous','false') <> 'true'
 and exists(select 1 from public.organizations o where public.is_active_organization_member(o.id))
$$;

alter table public.brand_identities enable row level security;
alter table public.brand_profile_versions enable row level security;
alter table public.brand_fact_definitions enable row level security;
alter table public.brand_profile_facts enable row level security;
alter table public.brand_evidence enable row level security;
alter table public.brand_fact_evidence enable row level security;
alter table public.brand_consultant_items enable row level security;
alter table public.organization_brands enable row level security;

create policy organization_brands_read on public.organization_brands for select to authenticated
using ((select private.brand_has_membership()) and public.is_active_organization_member(organization_id));
create policy brand_identity_read on public.brand_identities for select to authenticated
using ((select private.brand_has_membership()) and (visibility='shared' or exists(select 1 from public.organization_brands ob where ob.brand_id=id and ob.status='active')));
create policy brand_profile_read on public.brand_profile_versions for select to authenticated
using (status='published' and exists(select 1 from public.brand_identities b where b.id=brand_id));
create policy brand_definitions_read on public.brand_fact_definitions for select to authenticated using ((select private.brand_has_membership()));
create policy brand_facts_read on public.brand_profile_facts for select to authenticated
using (exists(select 1 from public.brand_profile_versions p where p.id=profile_id));
create policy brand_links_read on public.brand_fact_evidence for select to authenticated
using (exists(select 1 from public.brand_profile_versions p where p.id=profile_id));
create policy brand_evidence_read on public.brand_evidence for select to authenticated
using (exists(select 1 from public.brand_fact_evidence fe where fe.evidence_id=id));
create policy brand_consultant_read on public.brand_consultant_items for select to authenticated
using (exists(select 1 from public.brand_profile_versions p where p.id=profile_id));

revoke all on table public.brand_identities,public.brand_profile_versions,public.brand_fact_definitions,
 public.brand_profile_facts,public.brand_evidence,public.brand_fact_evidence,public.brand_consultant_items,public.organization_brands
 from public,anon,authenticated,service_role;
grant select on table public.brand_identities,public.brand_profile_versions,public.brand_fact_definitions,
 public.brand_profile_facts,public.brand_evidence,public.brand_fact_evidence,public.brand_consultant_items,public.organization_brands to authenticated;
grant select,insert,update,delete on table public.brand_identities,public.brand_profile_versions,
 public.brand_profile_facts,public.brand_evidence,public.brand_fact_evidence,public.brand_consultant_items,public.organization_brands to service_role;
-- Registry additions require trusted database administration, not service/client supplied keys.
grant select on table public.brand_fact_definitions to service_role;
revoke all on function private.brand_fact_value_valid(jsonb,text,text[]),private.brand_prevent_mutation(),
 private.brand_guard_profile(),private.brand_guard_content(),private.brand_guard_identity(),private.brand_has_membership()
 from public,anon,authenticated,service_role;
grant usage on schema private to authenticated,service_role;
grant execute on function private.brand_has_membership() to authenticated;
grant execute on function private.brand_fact_value_valid(jsonb,text,text[]) to service_role;

comment on table public.brand_profile_versions is 'Global reviewed snapshots; current is highest published version_number per brand. All published versions remain immutable and queryable.';
comment on table public.brand_fact_definitions is 'Exact canonical application paths; append through reviewed database administration. Definitions never change historical value semantics.';
comment on table public.organization_brands is 'Platform-provisioned tenant inventory/access relationship; tenant notes and preferences are deferred.';
