-- Add city field to businesses for location-specific hashtag generation
alter table public.businesses add column if not exists city text;
