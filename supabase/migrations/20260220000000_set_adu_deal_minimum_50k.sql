-- Set Multifamily ADU Opportunity minimum investment to $50,000
-- Deal page: https://equitymd.com/deals/multifamily-adu-opportunity
UPDATE deals
SET minimum_investment = 50000,
    updated_at = NOW()
WHERE slug = 'multifamily-adu-opportunity';
