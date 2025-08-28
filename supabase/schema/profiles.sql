create table public.profiles (
  id uuid not null,
  email text not null,
  full_name text null,
  avatar_url text null,
  user_type public.user_type null,
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

create table public.syndicators (
  id uuid not null default gen_random_uuid (),
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
  average_rating numeric(3, 2) null default 0.0,
  total_reviews integer null default 0,
  active_deals integer null default 0,
  specialties text[] null default '{}'::text[],
  team_size integer null default 0,
  notable_projects text[] null default '{}'::text[],
  investment_focus text[] null default '{}'::text[],
  min_investment bigint null default 0,
  target_markets text[] null default '{}'::text[],
  certifications text[] null default '{}'::text[],
  feat boolean null,
  constraint syndicators_pkey primary key (id),
  constraint syndicators_claimed_by_fkey foreign KEY (claimed_by) references profiles (id) on delete set null,
  constraint syndicators_min_investment_check check ((min_investment >= 0)),
  constraint syndicators_team_size_check check ((team_size >= 0)),
  constraint syndicators_total_reviews_check check ((total_reviews >= 0)),
  constraint syndicators_active_deals_check check ((active_deals >= 0)),
  constraint syndicators_verification_status_check check (
    (
      verification_status = any (
        array[
          'unverified'::text,
          'verified'::text,
          'premier'::text
        ]
      )
    )
  ),
  constraint syndicators_average_rating_check check (
    (
      (average_rating >= (0)::numeric)
      and (average_rating <= 5.0)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_syndicators_claimed_by_deals on public.syndicators using btree (claimed_by) TABLESPACE pg_default;

create index IF not exists idx_syndicators_state on public.syndicators using btree (state) TABLESPACE pg_default;

create index IF not exists idx_syndicators_city on public.syndicators using btree (city) TABLESPACE pg_default;

create index IF not exists idx_syndicators_average_rating on public.syndicators using btree (average_rating) TABLESPACE pg_default;

create index IF not exists idx_syndicators_total_reviews on public.syndicators using btree (total_reviews) TABLESPACE pg_default;

create index IF not exists idx_syndicators_active_deals on public.syndicators using btree (active_deals) TABLESPACE pg_default;

create index IF not exists idx_syndicators_specialties on public.syndicators using gin (specialties) TABLESPACE pg_default;

create index IF not exists idx_syndicators_target_markets on public.syndicators using gin (target_markets) TABLESPACE pg_default;

create index IF not exists idx_syndicators_slug on public.syndicators using btree (slug) TABLESPACE pg_default;

create index IF not exists idx_syndicators_claimed_by on public.syndicators using btree (claimed_by) TABLESPACE pg_default;

create index IF not exists idx_syndicators_claimed_by_lookup on public.syndicators using btree (claimed_by, id) TABLESPACE pg_default;

create index IF not exists idx_syndicators_claimed_by_verification on public.syndicators using btree (claimed_by, verification_status) TABLESPACE pg_default;

create index IF not exists idx_syndicators_claimable_status on public.syndicators using btree (claimable, verification_status) TABLESPACE pg_default;

create trigger update_syndicators_updated_at BEFORE
update on syndicators for EACH row
execute FUNCTION update_updated_at_column ();