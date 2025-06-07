-- Add 10 more strategic multifamily investment cities
INSERT INTO cities (name, slug, market_trends, investment_tips) VALUES 

-- Florida Markets
('Miami, FL', 'miami', 
'Miami continues to attract international capital and domestic migration in 2025, driving robust multifamily demand. The market benefits from no state income tax, strong job growth in finance and technology, and international business presence. Average cap rates range from 4.5% for waterfront properties to 7.2% for value-add opportunities in emerging neighborhoods. Areas like Brickell, Wynwood, and Little Havana show strong rental growth of 9% annually. The citys status as a gateway to Latin America ensures sustained high-income renter demand.',
'Focus on transit-oriented developments near Metrorail stations and emerging neighborhoods like Allapattah and Little River. Target properties within 10 miles of Brickell or Downtown for maximum appreciation. Consider hurricane-resistant buildings and factor insurance costs into projections. Look for workforce housing opportunities in the $250,000-$400,000 per unit range to capture the growing tech and finance workforce.'),

('Tampa, FL', 'tampa', 
'Tampa emerges as a major tech hub in 2025, with companies like Microsoft, Amazon, and numerous startups driving multifamily demand. The market shows 10% annual rent growth, supported by population influx from high-tax states. Cap rates average 5.8% for stabilized assets and up to 8.2% for value-add properties. Westshore, Hyde Park, and emerging areas like Seminole Heights command premium rents. The University of South Florida and strong healthcare sector provide demographic stability and consistent rental demand.',
'Target properties near downtown Tampa, Westshore business district, or USF campus. Look for 1990s-2000s vintage buildings with renovation potential in transitioning neighborhoods. The $180,000-$280,000 per unit acquisition range offers optimal returns. Consider properties near the upcoming streetcar expansion and focus on amenities that appeal to young professionals and students.'),

('Jacksonville, FL', 'jacksonville', 
'Jacksonville benefits from major corporate relocations and port expansion in 2025, creating strong multifamily fundamentals. Bank of America, Wells Fargo, and CSX headquarters drive high-income renter demand. The market shows steady 6% rent growth with cap rates of 6.2-7.8% depending on submarket. Riverside, Springfield, and Town Center areas lead in rental performance. As Floridas largest city by land area, Jacksonville offers diverse investment opportunities from urban infill to suburban garden-style communities.',
'Focus on properties near major employment centers like downtown, Riverfront, or the Town Center. Target the $120,000-$200,000 per unit range for best cash flow potential. Consider emerging neighborhoods like Springfield and Murray Hill before full gentrification. Properties near Naval Air Station Jacksonville provide stable military rental demand.'),

-- Texas Markets  
('Dallas, TX', 'dallas', 
'Dallas maintains its position as a multifamily powerhouse in 2025, with major corporate relocations continuing to drive demand. American Airlines, AT&T, and numerous Fortune 500 companies support high-income renter demographics. The market delivers 7% annual rent growth with cap rates from 4.9% in core areas to 7.5% in emerging submarkets. Deep Ellum, Uptown, and emerging areas like Bishop Arts District show strongest performance. DFWs massive scale provides diverse investment opportunities across all property classes.',
'Target properties near DART light rail stations and major employment corridors. Focus on emerging neighborhoods like Oak Cliff and East Dallas before full appreciation. The $200,000-$350,000 per unit range offers optimal risk-adjusted returns. Consider properties that appeal to corporate relocatees seeking urban amenities with Texas-sized space.'),

-- Southeast Markets
('Charleston, SC', 'charleston', 
'Charleston combines historic charm with modern economic growth in 2025, attracting young professionals and retirees alike. Boeing, Mercedes-Benz, and a thriving tourism industry support diverse rental demand. The market shows 8% annual rent growth with cap rates of 5.5-7.2% depending on location. Downtown, Mount Pleasant, and West Ashley areas command premium rents. The citys unique character and coastal location create supply constraints that benefit existing property owners.',
'Focus on properties within 15 minutes of downtown Charleston or major employment centers. Target historic neighborhoods undergoing revitalization like North Charleston and Summerville. The $150,000-$250,000 per unit acquisition range provides good entry points. Consider flood zones carefully and factor hurricane insurance. Properties appealing to both young professionals and visiting executives perform best.'),

('Richmond, VA', 'richmond', 
'Richmond benefits from its proximity to Washington DC while maintaining lower cost of living in 2025. VCU Health, Capital One, and government contractors drive stable rental demand. The market shows 5% annual rent growth with attractive cap rates of 6.0-8.0%. The Fan District, Scott\'s Addition, and Church Hill neighborhoods lead in rental performance. Richmonds emerging arts scene and food culture attract young professionals seeking urban lifestyle at reasonable costs.',
'Target properties in established neighborhoods like The Fan or emerging areas like Scott\'s Addition. Focus on the $100,000-$180,000 per unit range for optimal cash flow. Properties near VCU campus require specialized management but offer stable returns. Consider historic tax credit opportunities in certain neighborhoods for additional returns.'),

-- Midwest Markets
('Kansas City, MO', 'kansas-city', 
'Kansas City emerges as a tech and logistics hub in 2025, with Google Fiber infrastructure and central location driving business growth. Cerner, Hallmark, and numerous logistics companies support steady rental demand. The market shows 6% annual rent growth with attractive cap rates of 6.5-8.5%. Crossroads Arts District, Midtown, and emerging areas like East Crossroads show strongest performance. The citys affordable housing costs and growing tech scene attract young professionals.',
'Focus on properties near downtown, the Crossroads district, or major employment centers. Target the $80,000-$150,000 per unit range for exceptional cash flow potential. Consider emerging neighborhoods like East Crossroads and 18th & Vine before full gentrification. Properties near streetcar line provide connectivity premium.'),

('Indianapolis, IN', 'indianapolis', 
'Indianapolis combines affordable living with strong job growth in 2025, particularly in healthcare, technology, and logistics. Eli Lilly, Salesforce, and major healthcare systems drive rental demand. The market shows steady 5% rent growth with cap rates of 6.8-8.2%. Mass Ave, Fountain Square, and Broad Ripple neighborhoods command premium rents. The citys central location and business-friendly environment attract corporate expansions.',
'Target properties in established neighborhoods like Broad Ripple or emerging areas like Fountain Square. Focus on the $75,000-$125,000 per unit range for superior cash flow. Properties near downtown or major hospitals provide stable rental demand. Consider the Cultural Trail proximity for increased desirability among young professionals.'),

-- Mountain West
('Salt Lake City, UT', 'salt-lake-city', 
'Salt Lake City experiences exceptional growth in 2025, driven by tech company expansions and outdoor lifestyle appeal. Adobe, eBay, and numerous startups create high-income renter demand. The market shows 11% annual rent growth with cap rates of 4.8-6.5%. Sugar House, Marmalade District, and areas near University of Utah command premium rents. Limited developable land due to mountains creates natural supply constraints benefiting investors.',
'Focus on properties near downtown, University of Utah, or emerging neighborhoods like Sugar House. Target the $200,000-$300,000 per unit range despite higher entry costs for strong appreciation. Consider properties appealing to outdoor enthusiasts and tech workers. Proximity to ski resorts and hiking trails commands rent premiums.'),

-- Pacific Northwest  
('Portland, OR', 'portland', 
'Portland maintains strong fundamentals in 2025 despite regional economic headwinds, supported by its unique culture and tech presence. Nike, Intel, and numerous startups drive rental demand from high-income professionals. The market shows 4% annual rent growth with cap rates of 4.2-6.8%. Pearl District, Hawthorne, and emerging areas like Division-Richmond show strongest performance. Portlands urban growth boundary creates natural supply constraints.',
'Target properties in established neighborhoods like Hawthorne or emerging areas on the east side. Focus on the $250,000-$400,000 per unit range for stable cash flow. Properties near public transit lines command premiums given the citys sustainability focus. Consider buildings with green features and bike storage for maximum appeal to environmentally conscious renters.');

-- Create indexes for the new cities
CREATE INDEX IF NOT EXISTS idx_cities_slug_new ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_cities_name_new ON cities(name); 