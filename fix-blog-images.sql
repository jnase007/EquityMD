-- Fix broken blog post images
-- Run this in Supabase SQL Editor

-- Fix the 1031 exchange post specifically
UPDATE blog_posts 
SET image_url = 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&q=80&w=1200&h=630'
WHERE slug LIKE '1031-exchange%' 
   OR slug LIKE '%1031-exchange%';

-- Fix any Tax Strategy posts with broken/empty images
UPDATE blog_posts 
SET image_url = 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&q=80&w=1200&h=630'
WHERE category = 'Tax Strategy' 
  AND (image_url IS NULL OR image_url = '' OR image_url NOT LIKE 'https://images.unsplash%');

-- Fix any other posts with potentially broken AI-generated images
-- AI image URLs from x.ai or OpenAI often expire
UPDATE blog_posts 
SET image_url = CASE category
    WHEN 'Tax Strategy' THEN 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&q=80&w=1200&h=630'
    WHEN 'Deal Analysis' THEN 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200&h=630'
    WHEN 'Market Insights' THEN 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1200&h=630'
    WHEN 'Syndication' THEN 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200&h=630'
    WHEN 'Due Diligence' THEN 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200&h=630'
    WHEN 'Investment Strategy' THEN 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&q=80&w=1200&h=630'
    WHEN 'Investor Education' THEN 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200&h=630'
    WHEN 'Financing' THEN 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200&h=630'
    WHEN 'Property Management' THEN 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200&h=630'
    WHEN 'Exit Strategy' THEN 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=1200&h=630'
    ELSE 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200&h=630'
  END
WHERE image_url IS NULL 
   OR image_url = '' 
   OR image_url LIKE '%api.x.ai%'
   OR image_url LIKE '%oaidalleapi%'
   OR image_url LIKE '%openai%';

-- Verify the fix
SELECT slug, title, category, image_url 
FROM blog_posts 
WHERE slug LIKE '%1031%' 
ORDER BY created_at DESC;
