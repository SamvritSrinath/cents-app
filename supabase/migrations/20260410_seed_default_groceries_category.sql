-- Optional seed: global default category "Groceries" (visible to all authenticated users via RLS).
-- Run via Supabase migrations or SQL editor (postgres role). Adjust user_id if your schema disallows null.

insert into public.categories (name, icon, color, is_default, user_id)
select 'Groceries', '🥬', '#22c55e', true, null
where not exists (
  select 1
  from public.categories c
  where c.is_default = true
    and lower(trim(c.name)) = lower(trim('Groceries'))
);
