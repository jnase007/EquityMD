-- Створення розширення pgcrypto для використання функції gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Створення таблиці deal_media, якщо вона не існує
CREATE TABLE IF NOT EXISTS deal_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('image', 'video')),
  url text NOT NULL,
  title text,
  description text,
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Створення індексу для покращення продуктивності, якщо він не існує
CREATE INDEX IF NOT EXISTS idx_deal_media_deal_id ON deal_media(deal_id);

-- Включення RLS (Row Level Security)
ALTER TABLE deal_media ENABLE ROW LEVEL SECURITY;

-- Додавання політик, якщо вони не існують
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'deal_media' 
    AND policyname = 'Public can view media of active deals'
  ) THEN
    CREATE POLICY "Public can view media of active deals"
      ON deal_media
      FOR SELECT
      TO public
      USING (
        EXISTS (
          SELECT 1 FROM deals
          WHERE deals.id = deal_media.deal_id
          AND deals.status = 'active'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'deal_media' 
    AND policyname = 'Syndicators can manage their deal media'
  ) THEN
    CREATE POLICY "Syndicators can manage their deal media"
      ON deal_media
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM deals
          WHERE deals.id = deal_media.deal_id
          AND deals.syndicator_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Вставка зразкових медіа для демонстрації
-- Переконайтеся, що в таблиці deals є хоча б один активний запис
INSERT INTO deal_media (id, deal_id, type, url, title, description, "order")
SELECT 
  gen_random_uuid(), -- Генерація UUID для стовпця id
  d.id,
  'image',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80',
  'Building Exterior',
  'Modern office building with glass facade',
  1
FROM deals d
WHERE d.status = 'active'
LIMIT 1;

INSERT INTO deal_media (id, deal_id, type, url, title, description, "order")
SELECT 
  gen_random_uuid(), -- Генерація UUID для стовпця id
  d.id,
  'image',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80',
  'Lobby',
  'Elegant lobby with modern design',
  2
FROM deals d
WHERE d.status = 'active'
LIMIT 1;

INSERT INTO deal_media (id, deal_id, type, url, title, description, "order")
SELECT 
  gen_random_uuid(), -- Генерація UUID для стовпця id
  d.id,
  'image',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
  'Conference Room',
  'State-of-the-art conference facilities',
  3
FROM deals d
WHERE d.status = 'active'
LIMIT 1;

INSERT INTO deal_media (id, deal_id, type, url, title, description, "order")
SELECT 
  gen_random_uuid(), -- Генерація UUID для стовпця id
  d.id,
  'image',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80',
  'Office Space',
  'Open concept office area with natural light',
  4
FROM deals d
WHERE d.status = 'active'
LIMIT 1;

-- Додавання зразкового відео (використовуючи URL-заповнювач)
INSERT INTO deal_media (id, deal_id, type, url, title, description, "order")
SELECT 
  gen_random_uuid(), -- Генерація UUID для стовпця id
  d.id,
  'video',
  'https://example.com/sample-property-tour.mp4',
  'Property Tour',
  'Virtual tour of the entire property',
  5
FROM deals d
WHERE d.status = 'active'
LIMIT 1;
