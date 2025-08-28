create table public.deals (
  id uuid not null default gen_random_uuid (),
  syndicator_profile_id uuid null,
  title text not null,
  description text null,
  property_type text not null,
  location text not null,
  address jsonb null,
  investment_highlights text[] null,
  minimum_investment numeric not null,
  target_irr numeric null,
  investment_term integer null,
  total_equity numeric null,
  status public.deal_status null default 'draft'::deal_status,
  featured boolean null default false,
  cover_image_url text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  slug text GENERATED ALWAYS as (
    regexp_replace(
      lower(title),
      '[^a-z0-9]+'::text,
      '-'::text,
      'g'::text
    )
  ) STORED null,
  highlighted boolean not null default false,
  syndicator_id uuid not null,
  constraint deals_pkey primary key (id),
  constraint deals_syndicator_id_fkey foreign KEY (syndicator_id) references syndicators (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_deals_status on public.deals using btree (status) TABLESPACE pg_default;

create index IF not exists idx_deals_property_type on public.deals using btree (property_type) TABLESPACE pg_default;

create index IF not exists idx_deals_syndicator on public.deals using btree (syndicator_profile_id) TABLESPACE pg_default;

create index IF not exists idx_deals_slug on public.deals using btree (slug) TABLESPACE pg_default;

create index IF not exists idx_deals_highlighted on public.deals using btree (highlighted) TABLESPACE pg_default
where
  (highlighted = true);

create trigger on_new_deal
after INSERT on deals for EACH row
execute FUNCTION handle_new_deal_notification ();

create trigger update_deals_updated_at BEFORE
update on deals for EACH row
execute FUNCTION update_updated_at_column ();