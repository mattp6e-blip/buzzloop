-- Instagram connection on businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS instagram_user_id TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS instagram_access_token TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS instagram_connected BOOLEAN DEFAULT FALSE;

-- Reel support on social_posts
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'post';
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS reel_script JSONB;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS reel_theme TEXT;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS instagram_media_id TEXT;
