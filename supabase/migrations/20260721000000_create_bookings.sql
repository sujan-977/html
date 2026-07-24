create table if not exists public.bookings (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  email text not null,
  branch text not null,
  checkin date not null,
  checkout date not null,
  room_type text not null,
  guests integer,
  food text,
  payment_method text not null default 'TBD',
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

create index if not exists bookings_created_idx on public.bookings (created_at desc);
create index if not exists bookings_user_id_idx on public.bookings (user_id);
