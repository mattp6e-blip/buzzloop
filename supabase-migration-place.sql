-- Store user's own Google Maps Place ID for Places API lookups (no OAuth required)
alter table public.businesses
  add column if not exists google_place_id text,
  add column if not exists google_place_location jsonb; -- { lat: number, lng: number }
