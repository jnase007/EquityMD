# Supabase SCHEMA

Files in this directory should be considered generated and not modified directly

Normally, I would keep a copy of the schema here for agents to use as such

`supabase db dump -f supabase/schema.sql --password "$SUPABASE_DB_PASSWORD"`

this requires the database password, which I don't have

Instead, we will have individual `.sql` files that come from manually copy-pasting the definition from supabase
