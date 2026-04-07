-- Media: uploaded photos per business
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS uploaded_photos JSONB DEFAULT '[]'::jsonb;
