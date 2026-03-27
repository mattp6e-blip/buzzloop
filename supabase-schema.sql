-- Businesses table
create table public.businesses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  industry text not null,
  google_business_url text,
  logo_url text,
  brand_color text not null default '#e8470a',
  slug text not null unique,
  created_at timestamptz default now() not null
);

-- Reviews table
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  customer_name text,
  star_rating integer not null check (star_rating between 1 and 5),
  what_they_liked text not null,
  staff_name text,
  ai_draft text not null,
  posted_to_google boolean default false not null,
  created_at timestamptz default now() not null
);

-- Social posts table
create table public.social_posts (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  review_id uuid references public.reviews(id) on delete cascade not null,
  caption text not null,
  image_url text,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published')),
  scheduled_for timestamptz,
  created_at timestamptz default now() not null
);

-- RLS Policies
alter table public.businesses enable row level security;
alter table public.reviews enable row level security;
alter table public.social_posts enable row level security;

-- Businesses: owner only
create policy "Users can manage their own business"
  on public.businesses for all
  using (auth.uid() = user_id);

-- Reviews: business owner can read all; public insert (for QR flow)
create policy "Business owner can read reviews"
  on public.reviews for select
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

create policy "Anyone can insert a review"
  on public.reviews for insert
  with check (true);

-- Social posts: owner only
create policy "Users can manage their social posts"
  on public.social_posts for all
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );
