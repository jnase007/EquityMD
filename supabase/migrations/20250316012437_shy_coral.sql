DO $$ 
DECLARE
  summit_id uuid;
  horizon_id uuid;
  metro_id uuid;
  innovation_id uuid;
  evergreen_id uuid;
  deal_id uuid;
BEGIN
  -- Get syndicator IDs
  SELECT id INTO summit_id FROM syndicator_profiles WHERE company_name = 'Summit Capital Partners';
  SELECT id INTO horizon_id FROM syndicator_profiles WHERE company_name = 'Horizon Investment Group';
  SELECT id INTO metro_id FROM syndicator_profiles WHERE company_name = 'Metropolitan Real Estate';
  SELECT id INTO innovation_id FROM syndicator_profiles WHERE company_name = 'Innovation Healthcare Properties';
  SELECT id INTO evergreen_id FROM syndicator_profiles WHERE company_name = 'Evergreen Residential';

  -- Add more deals for Summit Capital Partners
  INSERT INTO deals (
    syndicator_id,
    title,
    description,
    property_type,
    location,
    investment_highlights,
    minimum_investment,
    target_irr,
    investment_term,
    total_equity,
    status,
    featured,
    cover_image_url
  ) VALUES
    (
      summit_id,
      'Summit Office Tower',
      'Class A office building in prime downtown location with stable, long-term tenants and value-add potential through amenity upgrades.',
      'Office',
      'Atlanta, GA',
      ARRAY['Prime downtown location', 'Stable tenant base', 'Value-add opportunity', 'Strong market fundamentals'],
      150000,
      17.5,
      6,
      45000000,
      'active',
      false,
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'
    ),
    (
      summit_id,
      'The Reserve at Summit Park',
      'Luxury garden-style apartment community in high-growth suburban market with strong demographics and limited new supply.',
      'Multi-Family',
      'Nashville, TN',
      ARRAY['Class A amenities', 'High-growth submarket', 'Limited new supply', 'Strong demographics'],
      100000,
      18.0,
      5,
      35000000,
      'active',
      false,
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80'
    );

  -- Add more deals for Horizon Investment Group
  INSERT INTO deals (
    syndicator_id,
    title,
    description,
    property_type,
    location,
    investment_highlights,
    minimum_investment,
    target_irr,
    investment_term,
    total_equity,
    status,
    featured,
    cover_image_url
  ) VALUES
    (
      horizon_id,
      'Horizon Tech Park',
      'Modern industrial/flex campus catering to technology and e-commerce tenants in rapidly growing tech corridor.',
      'Industrial',
      'Austin, TX',
      ARRAY['Tech-focused location', 'Flexible space design', 'High-growth market', 'Strong tenant demand'],
      200000,
      16.5,
      7,
      65000000,
      'active',
      false,
      'https://images.unsplash.com/photo-1553246969-7dcb4259a87b?auto=format&fit=crop&q=80'
    ),
    (
      horizon_id,
      'Horizon Distribution Center',
      'Last-mile distribution facility strategically located near major transportation routes with excellent access to population centers.',
      'Industrial',
      'Phoenix, AZ',
      ARRAY['Strategic location', 'Modern specifications', 'E-commerce growth', 'Transportation access'],
      175000,
      15.5,
      6,
      55000000,
      'active',
      false,
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80'
    );

  -- Add more deals for Metropolitan Real Estate
  INSERT INTO deals (
    syndicator_id,
    title,
    description,
    property_type,
    location,
    investment_highlights,
    minimum_investment,
    target_irr,
    investment_term,
    total_equity,
    status,
    featured,
    cover_image_url
  ) VALUES
    (
      metro_id,
      'Metro City Center',
      'Transit-oriented mixed-use development featuring luxury apartments, ground-floor retail, and creative office space.',
      'Mixed-Use',
      'San Francisco, CA',
      ARRAY['Transit access', 'Mixed-use synergy', 'Strong demographics', 'Retail pre-leasing'],
      200000,
      17.0,
      6,
      80000000,
      'active',
      false,
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'
    ),
    (
      metro_id,
      'The Metropolitan Residences',
      'Boutique luxury condominium development in prime urban location with high-end finishes and amenities.',
      'Multi-Family',
      'Seattle, WA',
      ARRAY['Luxury finishes', 'Prime location', 'Limited competition', 'Strong market'],
      150000,
      16.5,
      5,
      40000000,
      'active',
      false,
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80'
    );

  -- Add more deals for Innovation Healthcare Properties
  INSERT INTO deals (
    syndicator_id,
    title,
    description,
    property_type,
    location,
    investment_highlights,
    minimum_investment,
    target_irr,
    investment_term,
    total_equity,
    status,
    featured,
    cover_image_url
  ) VALUES
    (
      innovation_id,
      'Innovation Medical Campus',
      'State-of-the-art medical office campus adjacent to major hospital with long-term healthcare tenants.',
      'Medical',
      'Boston, MA',
      ARRAY['Hospital proximity', 'Long-term leases', 'Healthcare demand', 'Modern facilities'],
      125000,
      15.5,
      7,
      50000000,
      'active',
      false,
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80'
    ),
    (
      innovation_id,
      'Wellness Center at Innovation Park',
      'Modern medical office and wellness center featuring specialty practices and ambulatory surgery center.',
      'Medical',
      'Chicago, IL',
      ARRAY['Surgery center', 'Specialty practices', 'Growing market', 'Modern design'],
      100000,
      16.0,
      6,
      35000000,
      'active',
      false,
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80'
    );

  -- Add more deals for Evergreen Residential
  INSERT INTO deals (
    syndicator_id,
    title,
    description,
    property_type,
    location,
    investment_highlights,
    minimum_investment,
    target_irr,
    investment_term,
    total_equity,
    status,
    featured,
    cover_image_url
  ) VALUES
    (
      evergreen_id,
      'Evergreen Commons',
      'Sustainable garden-style apartment community featuring smart home technology and energy-efficient systems.',
      'Multi-Family',
      'Portland, OR',
      ARRAY['LEED certified', 'Smart technology', 'Energy efficient', 'Growing market'],
      75000,
      16.0,
      5,
      30000000,
      'active',
      false,
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80'
    ),
    (
      evergreen_id,
      'The Evergreen at Bellevue',
      'Mixed-use development combining sustainable apartments with ground-floor retail in tech-centric submarket.',
      'Mixed-Use',
      'Bellevue, WA',
      ARRAY['Tech corridor', 'Mixed-use design', 'Sustainable features', 'Strong demographics'],
      100000,
      17.0,
      6,
      45000000,
      'active',
      false,
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'
    );

  -- Add sample media for each deal
  FOR deal_id IN
    SELECT id FROM deals
    WHERE syndicator_id IN (summit_id, horizon_id, metro_id, innovation_id, evergreen_id)
  LOOP
    INSERT INTO deal_media (
      id,
      deal_id,
      type,
      url,
      title,
      description,
      "order"
    ) VALUES
      (
        gen_random_uuid(),
        deal_id,
        'image',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80',
        'Building Exterior',
        'Modern building exterior with architectural details',
        1
      ),
      (
        gen_random_uuid(),
        deal_id,
        'image',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
        'Lobby',
        'Elegant lobby with modern design',
        2
      ),
      (
        gen_random_uuid(),
        deal_id,
        'image',
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80',
        'Common Area',
        'Spacious common area with premium finishes',
        3
      );
  END LOOP;

END $$;
