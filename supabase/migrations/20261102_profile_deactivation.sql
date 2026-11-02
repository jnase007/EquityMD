-- Account deactivation fields used by self-serve, admin, and contact-form flows
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS deactivated_at timestamptz,
  ADD COLUMN IF NOT EXISTS deactivation_reason text,
  ADD COLUMN IF NOT EXISTS deactivated_by text;

CREATE INDEX IF NOT EXISTS profiles_is_active_idx ON public.profiles (is_active);
CREATE INDEX IF NOT EXISTS profiles_deactivated_at_idx ON public.profiles (deactivated_at);

COMMENT ON COLUMN public.profiles.is_active IS 'False when account is deactivated (self-serve, admin, or contact form)';
COMMENT ON COLUMN public.profiles.deactivated_at IS 'When the account was deactivated';
COMMENT ON COLUMN public.profiles.deactivation_reason IS 'User or admin reason for deactivation';
COMMENT ON COLUMN public.profiles.deactivated_by IS 'self | admin:<id> | contact_form';
