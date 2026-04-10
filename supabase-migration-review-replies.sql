ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS has_owner_reply BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS gbp_review_id TEXT DEFAULT NULL;

-- Index for fast lookup of unreplied Google reviews
CREATE INDEX IF NOT EXISTS idx_reviews_unreplied
  ON reviews (business_id, has_owner_reply, gbp_review_id)
  WHERE gbp_review_id IS NOT NULL AND has_owner_reply = FALSE;
