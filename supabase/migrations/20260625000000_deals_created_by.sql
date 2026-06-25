-- Track WHO created each deal (distinct from the syndicator the deal is pitched for).
--
-- Context: an admin (e.g. Justin) creates + publishes deals on behalf of
-- syndicators. The deal records syndicator_id (who it's for) but NOT who created
-- it. So an admin's "Your Deals" cannot distinguish deals they personally created
-- from deals other people created for other syndicators. This adds created_by.
--
-- Semantics:
--   * created_by = the auth user who created the deal (admin or syndicator owner)
--   * syndicator_id = the syndicator the deal is connected/pitched to (unchanged)
-- A deal therefore shows up for BOTH parties: the syndicator (by syndicator_id)
-- and the creator (by created_by).

ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_deals_created_by ON public.deals(created_by);

NOTIFY pgrst, 'reload schema';
