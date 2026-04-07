-- Project Reel Quality — migration
-- Run this in Supabase SQL editor

-- Reviews: remarkability scoring
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS remarkability_score INTEGER DEFAULT NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS anchor_sentence TEXT DEFAULT NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS remarkability_signal TEXT DEFAULT NULL;

-- Businesses: GBP photos + sync tracking
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS gbp_photos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS last_gbp_sync_at TIMESTAMPTZ DEFAULT NULL;

-- Index for fast "fetch unscored reviews" queries
CREATE INDEX IF NOT EXISTS reviews_remarkability_score_idx ON reviews (business_id, remarkability_score);
