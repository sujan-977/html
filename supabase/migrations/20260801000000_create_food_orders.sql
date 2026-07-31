-- Online food pre-orders placed from the Menu page, reviewed from the admin area.
create table if not exists public.food_orders (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  items jsonb not null,
  total numeric not null check (total >= 0),
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

alter table public.food_orders enable row level security;

create index if not exists food_orders_created_idx on public.food_orders (created_at desc);
create index if not exists food_orders_user_id_idx on public.food_orders (user_id);
