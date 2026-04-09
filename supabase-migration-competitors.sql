-- Growth Hub: competitor tracking table
create table if not exists public.competitors (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  google_place_id text not null,
  name text not null,
  url text,
  rating numeric(3,1),
  review_count integer default 0,
  types text[] default '{}',
  photo_count integer default 0,
  raw_data jsonb,
  last_synced_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(business_id, google_place_id)
);

alter table public.competitors enable row level security;

create policy "Users can manage their own competitors"
  on public.competitors for all
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  )
  with check (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );
