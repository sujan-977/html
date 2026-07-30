-- Room catalogue managed from the protected admin area.
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null check (price >= 0),
  description text,
  image_url text,
  capacity text,
  amenities text[] not null default '{}',
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rooms enable row level security;

create policy "Rooms are publicly viewable"
  on public.rooms for select using (true);

-- Files are uploaded by the server using the service-role key.
insert into storage.buckets (id, name, public)
values ('room-images', 'room-images', true)
on conflict (id) do update set public = true;
