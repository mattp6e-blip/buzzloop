alter table public.businesses
  add column if not exists website_url text,
  add column if not exists brand_font text default 'Inter',
  add column if not exists brand_secondary_color text,
  add column if not exists brand_logo_url text,
  add column if not exists brand_scraped boolean default false not null;

alter table public.social_posts
  add column if not exists scheduled_for timestamptz;
