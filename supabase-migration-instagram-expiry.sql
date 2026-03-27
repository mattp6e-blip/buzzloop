-- Add instagram_token_expiry column to track when the long-lived token expires (60 days)
alter table public.businesses
  add column if not exists instagram_token_expiry timestamptz;
