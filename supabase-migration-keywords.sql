-- Add keyword_rankings column to businesses
-- Stores: [{ keyword: string, rank: number | null, checkedAt: string }]
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS keyword_rankings JSONB DEFAULT NULL;
