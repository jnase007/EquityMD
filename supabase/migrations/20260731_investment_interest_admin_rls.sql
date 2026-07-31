-- EquityMD: admin full access on investment_requests + syndicator read for routing
-- Needed so Admin → Interest can update status and show deal owner.

BEGIN;

-- Ensure helper exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- investment_requests: admin SELECT + UPDATE (status changes from admin panel)
DROP POLICY IF EXISTS investment_requests_select_admin ON public.investment_requests;
DROP POLICY IF EXISTS investment_requests_update_admin ON public.investment_requests;
DROP POLICY IF EXISTS investment_requests_all_admin ON public.investment_requests;

CREATE POLICY investment_requests_select_admin ON public.investment_requests
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY investment_requests_update_admin ON public.investment_requests
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- deals: admin can read all (for interest panel deal/owner hydration)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='deals') THEN
    EXECUTE 'DROP POLICY IF EXISTS deals_select_admin ON public.deals';
    EXECUTE 'CREATE POLICY deals_select_admin ON public.deals FOR SELECT TO authenticated USING (public.is_admin())';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='syndicator_profiles') THEN
    EXECUTE 'DROP POLICY IF EXISTS syndicator_profiles_select_admin ON public.syndicator_profiles';
    EXECUTE 'CREATE POLICY syndicator_profiles_select_admin ON public.syndicator_profiles FOR SELECT TO authenticated USING (public.is_admin())';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='syndicators') THEN
    EXECUTE 'DROP POLICY IF EXISTS syndicators_select_admin ON public.syndicators';
    EXECUTE 'CREATE POLICY syndicators_select_admin ON public.syndicators FOR SELECT TO authenticated USING (public.is_admin())';
  END IF;
END $$;

COMMIT;
