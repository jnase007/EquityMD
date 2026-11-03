-- Lead source tracking for Meta/ads attribution
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lead_source text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS lead_source_note text,
  ADD COLUMN IF NOT EXISTS admin_starred boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.lead_source IS 'Acquisition channel: meta, google, organic, referral, admin, other';
COMMENT ON COLUMN public.profiles.admin_starred IS 'Admin star flag for important leads';

CREATE INDEX IF NOT EXISTS profiles_lead_source_idx ON public.profiles (lead_source);
CREATE INDEX IF NOT EXISTS profiles_admin_starred_idx ON public.profiles (admin_starred) WHERE admin_starred = true;
