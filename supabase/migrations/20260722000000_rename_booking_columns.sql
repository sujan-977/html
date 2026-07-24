-- Keeps already-created booking tables compatible with the current application fields.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bookings' and column_name = 'room') then
    alter table public.bookings rename column room to room_type;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bookings' and column_name = 'payment') then
    alter table public.bookings rename column payment to payment_method;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bookings' and column_name = 'created') then
    alter table public.bookings rename column created to created_at;
  end if;
end $$;
