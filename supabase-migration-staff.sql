-- Add staff_members array column to businesses
alter table public.businesses
  add column if not exists staff_members text[] not null default '{}';
