-- GMAIL-001: owner-private connected email accounts and isolated credentials.

create type public.email_provider as enum ('google', 'microsoft');
create type public.connected_email_account_status as enum (
  'pending', 'connected', 'action-required', 'revoked', 'disconnected'
);

create table public.connected_email_accounts (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default ('email_account_' || replace(gen_random_uuid()::text, '-', '')),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  owner_membership_id uuid not null,
  provider public.email_provider not null,
  provider_account_id text not null check (length(btrim(provider_account_id)) between 1 and 255),
  email_address text not null check (length(btrim(email_address)) between 3 and 320),
  display_name text check (display_name is null or length(btrim(display_name)) between 1 and 255),
  status public.connected_email_account_status not null default 'pending',
  granted_scopes text[] not null default '{}',
  connected_at timestamptz,
  last_token_refresh_at timestamptz,
  disconnected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint connected_email_accounts_public_id_key unique (public_id),
  constraint connected_email_accounts_provider_identity_key unique (organization_id, provider, provider_account_id),
  constraint connected_email_accounts_owner_same_organization_fk foreign key (owner_membership_id, organization_id)
    references public.organization_memberships (id, organization_id) on delete restrict,
  constraint connected_email_accounts_status_dates check (
    (status = 'connected' and connected_at is not null and disconnected_at is null)
    or (status <> 'connected')
  )
);

create index connected_email_accounts_owner_idx
  on public.connected_email_accounts (organization_id, owner_membership_id, updated_at desc);
create trigger connected_email_accounts_set_updated_at before update on public.connected_email_accounts
for each row execute function public.set_updated_at();

-- Ciphertext only. There are intentionally no anon/authenticated policies or grants.
create table public.connected_email_credentials (
  connected_email_account_id uuid primary key references public.connected_email_accounts (id) on delete cascade,
  cipher_provider text not null,
  cipher_version integer not null check (cipher_version > 0),
  encrypted_payload text not null,
  access_token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger connected_email_credentials_set_updated_at before update on public.connected_email_credentials
for each row execute function public.set_updated_at();

create table public.email_oauth_transactions (
  id uuid primary key default gen_random_uuid(),
  state_hash text not null unique check (length(state_hash) = 64),
  pkce_verifier_hash text not null check (length(pkce_verifier_hash) = 64),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  owner_membership_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  provider public.email_provider not null,
  return_path text not null check (return_path ~ '^/settings/email(?:[/?#].*)?$'),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint email_oauth_transactions_owner_same_organization_fk foreign key (owner_membership_id, organization_id)
    references public.organization_memberships (id, organization_id) on delete cascade
);
create index email_oauth_transactions_expiry_idx on public.email_oauth_transactions (expires_at);

alter table public.connected_email_accounts enable row level security;
alter table public.connected_email_credentials enable row level security;
alter table public.email_oauth_transactions enable row level security;

create policy connected_email_accounts_select_owner on public.connected_email_accounts
for select to authenticated using (owner_membership_id = public.current_active_membership_id(organization_id));
create policy email_oauth_transactions_select_owner on public.email_oauth_transactions
for select to authenticated using (
  user_id = auth.uid() and owner_membership_id = public.current_active_membership_id(organization_id)
);
create policy email_oauth_transactions_insert_owner on public.email_oauth_transactions
for insert to authenticated with check (
  user_id = auth.uid() and owner_membership_id = public.current_active_membership_id(organization_id)
  and expires_at <= now() + interval '10 minutes'
);
create policy email_oauth_transactions_delete_owner on public.email_oauth_transactions
for delete to authenticated using (
  user_id = auth.uid() and owner_membership_id = public.current_active_membership_id(organization_id)
);

revoke all on public.connected_email_accounts, public.connected_email_credentials, public.email_oauth_transactions from anon;
revoke all on public.connected_email_credentials from authenticated;
grant select on public.connected_email_accounts to authenticated;
grant select, insert, delete on public.email_oauth_transactions to authenticated;

comment on table public.connected_email_credentials is
  'Server-only encrypted OAuth credential envelopes. No browser-role access or plaintext tokens.';
comment on table public.connected_email_accounts is
  'Mailbox-private account metadata: only the active owning membership has ordinary access.';
