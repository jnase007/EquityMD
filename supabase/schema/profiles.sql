create table public.profiles (
  id uuid not null,
  email text not null,
  full_name text null,
  avatar_url text null,
  user_type public.user_type not null,
  is_verified boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  email_notifications jsonb null default jsonb_build_object(
    'messages',
    true,
    'deal_updates',
    true,
    'investment_status',
    true
  ),
  is_admin boolean null default false,
  referral_code text null default substr(md5((random())::text), 1, 8),
  phone_number text null,
  sms_opt_in text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_referral_code_key unique (referral_code),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id)
) TABLESPACE pg_default;

create trigger update_profiles_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION update_updated_at_column ();


create table public.investor_profiles (
  id uuid not null,
  accredited_status boolean null default false,
  accreditation_proof text null,
  investment_preferences jsonb null default '{}'::jsonb,
  minimum_investment numeric null,
  preferred_property_types text[] null,
  preferred_locations text[] null,
  risk_tolerance text null,
  investment_goals text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  multiplier_credits integer null default 0,
  linkedin_url text null,
  location text null,
  constraint investor_profiles_pkey primary key (id),
  constraint investor_profiles_id_fkey foreign KEY (id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;


create table public.syndicator_profiles (
  id uuid not null,
  company_name text not null,
  company_description text null,
  company_logo_url text null,
  website_url text null,
  linkedin_url text null,
  years_in_business integer null,
  total_deal_volume numeric null,
  verification_documents jsonb null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  state text null,
  city text null,
  slug text GENERATED ALWAYS as (
    regexp_replace(
      lower(company_name),
      '[^a-z0-9]+'::text,
      '-'::text,
      'g'::text
    )
  ) STORED null,
  claimable boolean null default true,
  claimed_at timestamp with time zone null,
  claimed_by uuid null,
  verification_status text null default 'unverified'::text,
  constraint syndicator_profiles_pkey primary key (id),
  constraint syndicator_profiles_claimed_by_fkey foreign KEY (claimed_by) references profiles (id),
  constraint syndicator_profiles_id_fkey foreign KEY (id) references profiles (id),
  constraint syndicator_profiles_verification_status_check check (
    (
      verification_status = any (
        array[
          'unverified'::text,
          'verified'::text,
          'premier'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_syndicator_profiles_state on public.syndicator_profiles using btree (state) TABLESPACE pg_default;

create index IF not exists idx_syndicator_profiles_city on public.syndicator_profiles using btree (city) TABLESPACE pg_default;

create index IF not exists idx_syndicator_profiles_slug on public.syndicator_profiles using btree (slug) TABLESPACE pg_default;

create trigger update_syndicator_profiles_updated_at BEFORE
update on syndicator_profiles for EACH row
execute FUNCTION update_updated_at_column ();

