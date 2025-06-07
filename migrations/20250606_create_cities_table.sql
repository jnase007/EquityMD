-- Create cities table for GEO targeting
CREATE TABLE IF NOT EXISTS cities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    market_trends TEXT NOT NULL,
    investment_tips TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial data for the 8 major investment cities
INSERT INTO cities (name, slug, market_trends, investment_tips) VALUES 
(
    'Nashville, TN',
    'nashville',
    'Nashville continues to experience unprecedented growth in 2025, with multifamily properties seeing a 12% appreciation year-over-year. The city''s thriving music and healthcare industries are driving population growth at 3.2% annually, creating strong rental demand. Cap rates for Class A properties average 5.2%, while Class B properties offer attractive 6.8% returns. The downtown core and emerging neighborhoods like The Gulch and Music Row are particularly hot for investors. New construction is struggling to keep pace with demand, creating opportunities for value-add acquisitions.',
    'Focus on properties within 5 miles of downtown Nashville or near major employment centers like Vanderbilt University Medical Center. Look for 1980s-2000s vintage buildings with renovation potential. The $25,000-$35,000 per unit renovation sweet spot can push rents from $1,200 to $1,600+ per month. Consider emerging neighborhoods like East Nashville and Germantown before they fully gentrify.'
),
(
    'Austin, TX',
    'austin',
    'Austin''s tech boom continues driving multifamily demand in 2025, with major companies like Tesla, Apple, and Meta expanding operations. The market shows 8% rent growth annually, though new supply is moderating price appreciation. Cap rates range from 4.8% for core assets to 7.2% for suburban value-add opportunities. The Domain, South Austin, and East Austin submarkets are seeing the strongest investor interest. Population growth of 2.8% annually is supported by a diversified economy beyond tech, including government and education sectors.',
    'Target properties near major tech corridors and public transportation lines. The upcoming Project Connect light rail will significantly impact property values along its route. Look for workforce housing opportunities in the $200,000-$300,000 per unit range. Consider suburban markets like Cedar Park and Round Rock for better cash flow potential. Avoid over-leveraging given the cyclical nature of the tech industry.'
),
(
    'Charlotte, NC',
    'charlotte',
    'Charlotte''s emergence as a major financial hub has created exceptional multifamily investment opportunities in 2025. Bank of America''s continued expansion and Wells Fargo''s presence drive high-income renter demand. The market shows steady 6% annual rent growth with cap rates of 5.5-7.0% depending on submarket. South End, Uptown, and NoDa neighborhoods command premium rents. New supply is well-absorbed by job growth in financial services, healthcare, and technology sectors. The city''s pro-business environment attracts young professionals seeking urban amenities.',
    'Prioritize properties near the LYNX light rail system and major employment centers like Uptown and South End. Look for renovation opportunities in transitioning neighborhoods like Plaza Midwood and Villa Heights. Target the $150,000-$250,000 per unit acquisition price point for optimal returns. Consider partnering with local property management companies familiar with Charlotte''s unique rental market dynamics and tenant preferences.'
),
(
    'Phoenix, AZ',
    'phoenix',
    'Phoenix multifamily market remains robust in 2025 despite slower population growth compared to pandemic years. The market benefits from California migration and corporate relocations, maintaining 4% annual rent growth. Cap rates average 5.8% for stabilized assets and up to 8.5% for value-add opportunities. Scottsdale, Tempe, and central Phoenix submarkets show strongest fundamentals. New construction costs have moderated, but existing inventory in prime locations remains attractive. The diverse economy spanning healthcare, manufacturing, and technology provides stability.',
    'Focus on properties built after 1990 to avoid costly infrastructure issues common in older desert construction. Target areas with good freeway access, particularly near Loop 101 and Interstate 10 corridors. Water rights and utility costs are critical factors - verify sustainable operating expenses. Consider emerging areas like Ahwatukee and North Phoenix for better entry pricing. Pool and air conditioning systems require significant capital planning in this climate.'
),
(
    'Raleigh, NC',
    'raleigh',
    'Raleigh''s Research Triangle reputation continues attracting top talent and multifamily investment in 2025. The presence of Duke, UNC, and NC State creates stable rental demand from students and young professionals. Annual rent growth of 7% is supported by tech company expansions and pharmaceutical industry growth. Cap rates range from 5.0% for institutional-quality assets to 7.5% for value-add opportunities. Downtown Raleigh, North Hills, and areas near RTP (Research Triangle Park) command premium pricing. The market benefits from relatively affordable housing compared to other major tech hubs.',
    'Target properties within the I-440 beltline or near major universities and RTP. Student housing requires specialized management but offers stable cash flows. Look for 1980s-1990s garden-style communities with renovation potential in established neighborhoods. Consider the upcoming BRT (Bus Rapid Transit) system when evaluating long-term appreciation potential. Focus on areas attracting young families and professionals, particularly near top-rated school districts.'
),
(
    'Atlanta, GA',
    'atlanta',
    'Atlanta''s multifamily market shows strong fundamentals in 2025, driven by the city''s role as the Southeast''s business capital. Hartsfield-Jackson Airport, major corporate headquarters, and a thriving film industry support diverse renter demographics. The market delivers 5% annual rent growth with cap rates from 5.2% in core areas to 8.0% in emerging submarkets. Midtown, Buckhead, and the Beltline corridor command premium rents. New supply is concentrated in high-growth areas, creating opportunities in established neighborhoods with good bones but dated finishes.',
    'Prioritize properties near MARTA stations and the Atlanta Beltline for maximum appreciation potential. Target the $100,000-$200,000 per unit range in established neighborhoods like Virginia Highland, Inman Park, and East Atlanta. Consider crime statistics and neighborhood trajectories carefully - Atlanta''s market can vary dramatically by micro-location. Focus on properties that can attract young professionals working downtown but seeking more space and amenities than urban high-rises provide.'
),
(
    'Orlando, FL',
    'orlando',
    'Orlando''s multifamily market benefits from tourism recovery and continued population growth in 2025. Theme parks, healthcare systems, and a growing tech sector drive rental demand beyond seasonal tourism workers. Annual rent growth of 8% reflects strong fundamentals, with cap rates ranging from 5.5% for stabilized assets to 7.8% for value-add plays. Areas near Universal Studios, downtown Orlando, and Winter Park show strongest investor interest. The lack of state income tax continues attracting residents from high-tax states, supporting long-term demand.',
    'Focus on properties serving permanent residents rather than short-term tourism workers for more stable cash flows. Target areas near major employment centers like AdventHealth, Lockheed Martin, and the University of Central Florida. Avoid flood-prone areas and factor hurricane insurance into operating expense projections. Consider emerging neighborhoods like Mills 50 and SODO for appreciation potential. Properties near toll roads (408, 417, 429) offer convenience that commands rent premiums.'
),
(
    'Denver, CO',
    'denver',
    'Denver''s multifamily market shows resilience in 2025 despite economic headwinds, supported by outdoor lifestyle appeal and diverse economy. Tech companies, aerospace, and energy sectors provide employment stability. Annual rent growth of 4% reflects market maturation, with cap rates from 5.0% in core urban areas to 7.5% in suburban markets. LoDo, RiNo, and Capitol Hill command premium rents, while emerging areas like Stapleton and Green Valley Ranch offer value opportunities. Legal cannabis industry and outdoor recreation economy attract young professionals seeking work-life balance.',
    'Target properties near light rail lines (A, B, G lines) for maximum connectivity and appreciation potential. Focus on energy-efficient buildings given Colorado''s environmental consciousness and utility costs. Consider altitude and weather impacts on building systems and maintenance costs. Look for properties that appeal to outdoor enthusiasts - bike storage, gear rooms, and pet-friendly amenities command rent premiums. Avoid over-exposure to energy sector volatility by diversifying across multiple employment centers.'
);

-- Create indexes for better performance
CREATE INDEX idx_cities_slug ON cities(slug);
CREATE INDEX idx_cities_name ON cities(name); 