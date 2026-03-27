-- Add Google OAuth fields to businesses table
alter table public.businesses
  add column if not exists google_access_token text,
  add column if not exists google_refresh_token text,
  add column if not exists google_token_expiry timestamptz,
  add column if not exists google_connected boolean default false not null,
  add column if not exists google_location_id text;
