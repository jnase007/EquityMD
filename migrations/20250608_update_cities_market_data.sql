-- Add market data columns to existing cities table
ALTER TABLE cities ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS median_price INTEGER;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS sales_change FLOAT;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS months_supply FLOAT;

-- Clear existing data and insert 25 major cities with market data
DELETE FROM cities;

INSERT INTO cities (name, state, slug, median_price, sales_change, months_supply, market_trends, investment_tips) VALUES 
(
    'New York', 'New York', 'new-york',
    1200000, -8.5, 4.2,
    'New York City remains the most expensive multifamily market in 2025, with Manhattan leading at $1.2M median price. Brooklyn and Queens offer relative value with stronger rental yields. The market faces headwinds from remote work policies and high taxes, but international buyer interest and limited new supply support pricing. Luxury buildings command premium rents while older walk-ups provide cash flow opportunities.',
    'Focus on outer boroughs for better cash flow potential. Target pre-war buildings with renovation upside in neighborhoods like Astoria, Long Island City, and Park Slope. Consider rent stabilization laws when underwriting deals. Properties near subway lines command significant premiums. Factor in high property taxes and maintenance costs when evaluating returns.'
),
(
    'Los Angeles', 'California', 'los-angeles',
    950000, -5.2, 3.8,
    'Los Angeles multifamily market shows signs of cooling in 2025 after years of rapid appreciation. High interest rates and affordability constraints are moderating both sales and rental growth. However, limited new construction and continued population growth support fundamentals. Beach communities and West Side maintain premium pricing while inland areas offer better value.',
    'Target emerging neighborhoods like Arts District, Highland Park, and Mid-City for appreciation potential. Focus on 1960s-1980s apartment buildings with renovation opportunities. Consider rent control regulations (RSO) when evaluating deals. Properties near Metro lines and major employment centers command rent premiums. Factor seismic and environmental costs into renovation budgets.'
),
(
    'Chicago', 'Illinois', 'chicago',
    380000, -2.1, 4.5,
    'Chicago offers compelling value for multifamily investors in 2025, with significantly lower entry costs than coastal markets. Downtown and North Side neighborhoods show stability while South and West Side areas present value-add opportunities. The city''s challenges with population decline are offset by affordable housing relative to job opportunities in finance, healthcare, and technology.',
    'Focus on gentrifying neighborhoods like Logan Square, Wicker Park, and Pilsen for appreciation upside. Target courtyard buildings and vintage walk-ups with character that appeal to young professionals. Consider property tax implications and budget for winter utility costs. Near CTA stations and university areas provide stable rental demand.'
),
(
    'Houston', 'Texas', 'houston',
    320000, 6.8, 2.9,
    'Houston multifamily market benefits from no state income tax and diverse economy beyond oil and gas. The medical center, aerospace, and port activities drive rental demand. New supply is being absorbed by job growth and population increases. Energy sector recovery and corporate relocations from California support positive fundamentals.',
    'Target properties near major employment centers like the Medical Center, Energy Corridor, and Galleria area. Focus on Class B properties with renovation potential in established neighborhoods. Consider flood risk and insurance costs in low-lying areas. Properties with covered parking and good drainage command premiums in Houston''s climate.'
),
(
    'Phoenix', 'Arizona', 'phoenix',
    425000, 12.3, 2.7,
    'Phoenix continues strong performance in 2025, driven by California migration and corporate relocations. The market benefits from job growth in healthcare, technology, and manufacturing. New construction costs have moderated but remain elevated, supporting existing inventory values. Scottsdale and North Phoenix command premium pricing.',
    'Focus on properties built after 1990 to avoid costly infrastructure issues. Target areas with freeway access and proximity to major employers like Intel, Honeywell, and Mayo Clinic. Consider water usage and utility costs in investment analysis. Pool maintenance and HVAC systems require significant capital planning in desert climate.'
),
(
    'Philadelphia', 'Pennsylvania', 'philadelphia',
    295000, -1.8, 3.9,
    'Philadelphia offers affordable entry points for multifamily investment in 2025. University City, Northern Liberties, and Fishtown show gentrification trends while maintaining relative affordability. The presence of major universities and hospitals provides stable rental demand. City wage tax impacts net operating income considerations.',
    'Target neighborhoods near universities like Penn, Drexel, and Temple for steady rental demand. Focus on converting single-family rowhomes to multifamily where zoning permits. Consider lead paint and historical preservation requirements in older buildings. Properties near SEPTA stations offer connectivity premiums.'
),
(
    'San Antonio', 'Texas', 'san-antonio',
    285000, 4.2, 3.1,
    'San Antonio provides excellent cash flow opportunities in 2025, with affordable housing costs and steady job growth. Military bases, healthcare systems, and growing tech sector support rental demand. The market lacks the volatility of other Texas cities while maintaining steady appreciation and strong fundamentals.',
    'Target properties near major employers like USAA, Valero, and military installations. Focus on newer construction (post-2000) for lower maintenance costs. Consider flood-prone areas near creeks and factor insurance costs. Properties with amenities like pools and fitness centers command rent premiums year-round.'
),
(
    'San Diego', 'California', 'san-diego',
    825000, -3.7, 3.4,
    'San Diego multifamily market faces affordability challenges in 2025 but benefits from limited new supply and strong job growth in biotech and defense. Coastal proximity and year-round climate support premium pricing. University City and downtown areas show strongest fundamentals while eastern suburbs offer value opportunities.',
    'Focus on areas near major employers like UC San Diego, Scripps, and Qualcomm. Target 1970s-1990s properties with ocean proximity for appreciation potential. Consider coastal commission regulations for properties near the ocean. Factor in high insurance costs and seismic requirements. Properties with parking and outdoor space command significant premiums.'
),
(
    'Dallas', 'Texas', 'dallas',
    345000, 7.1, 2.8,
    'Dallas continues robust growth in 2025, supported by corporate relocations and no state income tax advantages. The market benefits from diverse economy spanning finance, technology, and healthcare. New supply is being absorbed by strong job growth and population increases from other states.',
    'Target properties near major employment centers like Legacy West, Deep Ellum, and Downtown. Focus on Class B properties in established neighborhoods with renovation potential. Consider areas near DART light rail for connectivity advantages. Properties with covered parking and modern amenities command rent premiums.'
),
(
    'San Jose', 'California', 'san-jose',
    1350000, -6.8, 4.1,
    'San Jose remains the most expensive market for multifamily investment in 2025, driven by Silicon Valley tech demand. High barrier to entry limits competition while tech industry layoffs create some headwinds. Long-term fundamentals supported by limited land availability and high-paying jobs.',
    'Focus on smaller multifamily properties (2-4 units) for owner-occupied strategies. Target areas within commuting distance to major tech campuses. Consider rent control implications and high renovation costs. Properties with parking and outdoor space are essential given high housing costs.'
),
(
    'Austin', 'Texas', 'austin',
    485000, 3.4, 3.2,
    'Austin''s tech boom continues driving multifamily demand in 2025, with major companies like Tesla, Apple, and Meta expanding operations. The market shows steady rent growth though new supply is moderating price appreciation. The Domain, South Austin, and East Austin submarkets show strongest investor interest.',
    'Target properties near major tech corridors and future light rail lines. Focus on workforce housing in the $300,000-$400,000 per unit range. Consider emerging neighborhoods like Mueller and Riverside for appreciation potential. Avoid over-leveraging given tech industry cyclicality.'
),
(
    'Jacksonville', 'Florida', 'jacksonville',
    295000, 3.8, 3.3,
    'Jacksonville offers compelling value in Florida''s multifamily market for 2025. No state income tax, growing port operations, and financial services sector support rental demand. The market provides better cash flow than South Florida while maintaining appreciation potential.',
    'Target properties near downtown, Southside, and beach communities for appreciation upside. Focus on 1980s-2000s properties with renovation potential. Consider flood insurance costs for properties in flood zones. Properties with hurricane-resistant features and covered parking command premiums.'
),
(
    'San Francisco', 'California', 'san-francisco',
    1450000, -12.5, 5.2,
    'San Francisco faces significant headwinds in 2025 with remote work policies, high crime concerns, and regulatory challenges. However, limited supply and eventual tech recovery could support long-term values. Current market provides potential value opportunities for patient investors.',
    'Consider contrarian investing in quality buildings at discounted prices. Focus on neighborhoods with improving fundamentals like Mission Bay and SOMA. Factor in extensive tenant protection laws and potential rent control expansion. Properties with parking and outdoor space are essential given high housing density.'
),
(
    'Columbus', 'Ohio', 'columbus',
    265000, 2.9, 3.7,
    'Columbus provides steady multifamily investment opportunities in 2025, supported by Ohio State University, state government, and diverse economy. The market offers attractive cash flow potential with moderate appreciation and low entry costs compared to coastal markets.',
    'Target properties near OSU campus and downtown for steady rental demand. Focus on Short North, German Village, and emerging neighborhoods like Franklinton. Consider student housing near campus for stable cash flows. Properties with parking and modern amenities command rent premiums.'
),
(
    'Fort Worth', 'Texas', 'fort-worth',
    315000, 5.6, 3.0,
    'Fort Worth benefits from Dallas-Fort Worth metroplex growth while maintaining more affordable entry points in 2025. The market is supported by aviation, manufacturing, and healthcare sectors. Cultural district and downtown revitalization drive rental demand.',
    'Target properties near downtown, TCU campus, and Cultural District for appreciation potential. Focus on historic neighborhoods like Fairmount and Ryan Place with character appeal. Consider areas near Trinity Metro for connectivity advantages. Properties with Texas-sized amenities command rent premiums.'
),
(
    'Charlotte', 'North Carolina', 'charlotte',
    365000, -2.3, 3.6,
    'Charlotte''s emergence as a major financial hub creates exceptional multifamily opportunities in 2025. Bank of America and Wells Fargo presence drives high-income renter demand. South End, Uptown, and NoDa neighborhoods command premium rents with strong fundamentals.',
    'Target properties near LYNX light rail system and major employment centers. Focus on transitioning neighborhoods like Plaza Midwood and Villa Heights for appreciation upside. Consider the $200,000-$300,000 per unit range for optimal returns. Partner with local management companies familiar with Charlotte market dynamics.'
),
(
    'Seattle', 'Washington', 'seattle',
    775000, -4.2, 4.0,
    'Seattle multifamily market faces headwinds in 2025 from tech layoffs and remote work policies. However, limited supply, Amazon''s continued presence, and eventual tech recovery support long-term fundamentals. Eastside suburbs show more stability than urban core.',
    'Consider Eastside markets like Bellevue and Redmond for tech worker demand. Target properties near light rail stations for connectivity premiums. Factor in high construction costs and lengthy permitting processes. Properties with covered parking and modern amenities are essential in Seattle''s climate.'
),
(
    'Denver', 'Colorado', 'denver',
    465000, 1.8, 3.5,
    'Denver multifamily market shows resilience in 2025, supported by outdoor lifestyle appeal and diverse economy. Tech companies, aerospace, and energy sectors provide employment stability. LoDo, RiNo, and emerging areas like Stapleton offer investment opportunities.',
    'Target properties near light rail lines for maximum connectivity. Focus on energy-efficient buildings given environmental consciousness and utility costs. Consider emerging neighborhoods like Green Valley Ranch and Stapleton for appreciation potential. Properties appealing to outdoor enthusiasts command rent premiums.'
),
(
    'Washington DC', 'District of Columbia', 'washington-dc',
    615000, -3.1, 3.9,
    'Washington DC multifamily market benefits from federal government stability and high-income demographics in 2025. Areas near Metro stations command premium pricing while emerging neighborhoods offer value opportunities. Policy changes and remote work trends create some uncertainty.',
    'Target properties near Metro stations for maximum appeal to government workers and contractors. Focus on neighborhoods like Shaw, H Street Corridor, and Anacostia for appreciation potential. Consider security features and parking given urban density. Properties with modern amenities command significant rent premiums.'
),
(
    'Boston', 'Massachusetts', 'boston',
    685000, -1.7, 3.8,
    'Boston multifamily market supported by world-class universities and healthcare systems in 2025. Cambridge, Somerville, and emerging neighborhoods like South End offer investment opportunities. High barrier to entry limits competition while student and professional demand remains strong.',
    'Target properties near universities and Red Line for stable rental demand. Focus on triple-decker conversions and brownstone renovations in gentrifying areas. Consider parking scarcity and winter utility costs in investment analysis. Properties with character and modern updates command premium rents.'
),
(
    'Nashville', 'Tennessee', 'nashville',
    395000, 8.9, 2.9,
    'Nashville experiences unprecedented growth in 2025, with music industry, healthcare, and tourism driving multifamily demand. Downtown core and neighborhoods like Music Row command premium pricing while emerging areas offer value opportunities.',
    'Target properties near downtown, Vanderbilt, and major employment centers. Focus on emerging neighborhoods like East Nashville and Germantown before full gentrification. Consider the $200,000-$350,000 per unit range for optimal returns. Properties with character and modern amenities appeal to young professionals.'
),
(
    'Oklahoma City', 'Oklahoma', 'oklahoma-city',
    185000, 4.1, 3.4,
    'Oklahoma City provides excellent cash flow opportunities in 2025, with low entry costs and steady energy sector recovery. Downtown revitalization and state government employment support rental demand while maintaining affordable housing costs.',
    'Target properties near downtown, OU Health Sciences Center, and emerging districts like Film Row. Focus on Class B properties with renovation potential in established neighborhoods. Consider energy sector cyclicality in long-term planning. Properties with covered parking and storm protection features command premiums.'
),
(
    'Las Vegas', 'Nevada', 'las-vegas',
    385000, 9.2, 2.6,
    'Las Vegas multifamily market shows strong recovery in 2025, driven by California migration and tourism industry rebound. No state income tax and growing tech sector support population growth while gaming and hospitality provide economic diversity.',
    'Target properties in master-planned communities like Summerlin and Henderson for family appeal. Focus on newer construction (post-2005) with modern amenities. Consider areas near major employers like Allegiant, Southwest Airlines, and growing tech companies. Properties with resort-style amenities command rent premiums.'
),
(
    'Louisville', 'Kentucky', 'louisville',
    235000, 3.2, 3.6,
    'Louisville offers attractive multifamily investment opportunities in 2025, supported by diverse economy including healthcare, manufacturing, and logistics. The market provides strong cash flow potential with moderate appreciation and affordable entry costs.',
    'Target properties near downtown, University of Louisville, and major employers like UPS and Humana. Focus on historic neighborhoods like Cherokee Triangle and Highlands for character appeal. Consider bourbon tourism impact on short-term rental potential. Properties with parking and modern updates command rent premiums.'
),
(
    'Memphis', 'Tennessee', 'memphis', 
    195000, 2.7, 3.8,
    'Memphis provides exceptional cash flow opportunities in 2025, with very low entry costs and steady rental demand from logistics, healthcare, and agricultural sectors. FedEx headquarters and strategic location support economic fundamentals despite urban challenges.',
    'Target properties near major employers like FedEx, St. Jude, and University of Memphis. Focus on established neighborhoods like Cooper-Young and Central Gardens for stability. Consider security features and property management quality given market dynamics. Properties in good school districts command significant premiums.'
);

-- Create additional indexes for market data
CREATE INDEX idx_cities_state ON cities(state);
CREATE INDEX idx_cities_median_price ON cities(median_price);
CREATE INDEX idx_cities_sales_change ON cities(sales_change);

-- Create update_logs table for tracking data updates
CREATE TABLE IF NOT EXISTS update_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for update_logs
CREATE INDEX idx_update_logs_table_name ON update_logs(table_name);
CREATE INDEX idx_update_logs_updated_at ON update_logs(updated_at); 