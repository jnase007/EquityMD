-- Allow the public (anon + authenticated) to view "closed" (Fully Funded) deals.
--
-- Context: the deal detail page shows a "Fully Funded" state when deals.status = 'closed'.
-- The existing public SELECT policy on `deals` only exposes status = 'active' rows, so a
-- closed deal 404s for anonymous visitors. RLS SELECT policies are combined with OR, so
-- this is purely ADDITIVE — it does not modify or drop the existing active-deals policy.
--
-- Funded deals are intentionally still excluded from the active Find Deals feed by the
-- application query (Browse filters status IN ('active','draft')); this policy only makes
-- the direct deal URL reachable so the Fully Funded badge can render.

DROP POLICY IF EXISTS "Public can view closed (funded) deals" ON deals;

CREATE POLICY "Public can view closed (funded) deals"
  ON deals
  FOR SELECT
  TO anon, authenticated
  USING (status = 'closed');
