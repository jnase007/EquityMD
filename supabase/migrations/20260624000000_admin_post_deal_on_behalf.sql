-- Allow platform admins to post deals on behalf of ANY syndicator.
--
-- Context: Justin (admin) frequently onboards deals for clients who don't know
-- how to list a deal themselves. Rather than logging in as the client, an admin
-- creates the deal through the wizard and assigns it to the client's syndicator
-- profile. The existing deals INSERT/UPDATE policies only allow the syndicator
-- OWNER (syndicators.claimed_by = auth.uid()), which blocks this. These policies
-- add an admin bypass so admins can insert/update a deal for any syndicator_id.
--
-- Note: this only RELAXES access for admins; the existing owner policies remain
-- intact, so normal syndicators are unaffected.

-- Admins can insert a deal for any syndicator.
DROP POLICY IF EXISTS "Admins can insert deals for any syndicator" ON deals;
CREATE POLICY "Admins can insert deals for any syndicator"
  ON deals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can update any deal (needed for the wizard's post-insert cover_image
-- update + general moderation/onboarding fixes).
DROP POLICY IF EXISTS "Admins can update any deal" ON deals;
CREATE POLICY "Admins can update any deal"
  ON deals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Allow admins to manage deal_media for any deal (wizard uploads images after
-- insert; the existing media policy is scoped to the syndicator owner).
DROP POLICY IF EXISTS "Admins can manage any deal media" ON deal_media;
CREATE POLICY "Admins can manage any deal media"
  ON deal_media
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
