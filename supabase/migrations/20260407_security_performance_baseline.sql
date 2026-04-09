-- Security + performance baseline for Cents
-- Safe to run multiple times when objects already exist.

begin;

-- 1) RLS must be enabled for app-facing tables.
alter table if exists public.expenses enable row level security;
alter table if exists public.profiles enable row level security;
alter table if exists public.categories enable row level security;

-- 2) Drop previous policies if they exist so migration is idempotent.
drop policy if exists "expenses_select_own" on public.expenses;
drop policy if exists "expenses_insert_own" on public.expenses;
drop policy if exists "expenses_update_own" on public.expenses;
drop policy if exists "expenses_delete_own" on public.expenses;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

drop policy if exists "categories_select_visible" on public.categories;
drop policy if exists "categories_insert_own" on public.categories;
drop policy if exists "categories_update_own" on public.categories;
drop policy if exists "categories_delete_own" on public.categories;

-- 3) Least-privilege policies for expenses.
create policy "expenses_select_own"
on public.expenses
for select
to authenticated
using (user_id = auth.uid());

create policy "expenses_insert_own"
on public.expenses
for insert
to authenticated
with check (user_id = auth.uid());

create policy "expenses_update_own"
on public.expenses
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "expenses_delete_own"
on public.expenses
for delete
to authenticated
using (user_id = auth.uid());

-- 4) Least-privilege policies for profiles.
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- 5) Category visibility: users can see default categories + their own categories.
create policy "categories_select_visible"
on public.categories
for select
to authenticated
using (is_default = true or user_id = auth.uid());

create policy "categories_insert_own"
on public.categories
for insert
to authenticated
with check (user_id = auth.uid() and is_default = false);

create policy "categories_update_own"
on public.categories
for update
to authenticated
using (user_id = auth.uid() and is_default = false)
with check (user_id = auth.uid() and is_default = false);

create policy "categories_delete_own"
on public.categories
for delete
to authenticated
using (user_id = auth.uid() and is_default = false);

-- 6) Performance indexes for core expense queries.
create index if not exists idx_expenses_user_date
  on public.expenses (user_id, expense_date desc);

create index if not exists idx_expenses_user_category_date
  on public.expenses (user_id, category_id, expense_date desc);

create index if not exists idx_expenses_user_created
  on public.expenses (user_id, created_at desc);

-- 7) Storage policies for private receipt files in a 'receipts' bucket.
-- This block is best run from Supabase Dashboard SQL Editor (postgres role).
-- If run from a role that does not own storage tables, it will be skipped.
do $$
begin
  begin
    insert into storage.buckets (id, name, public)
    values ('receipts', 'receipts', false)
    on conflict (id) do update set public = false;

    alter table if exists storage.objects enable row level security;

    drop policy if exists "receipts_select_own" on storage.objects;
    drop policy if exists "receipts_insert_own" on storage.objects;
    drop policy if exists "receipts_update_own" on storage.objects;
    drop policy if exists "receipts_delete_own" on storage.objects;

    create policy "receipts_select_own"
    on storage.objects
    for select
    to authenticated
    using (
      bucket_id = 'receipts'
      and owner = auth.uid()
    );

    create policy "receipts_insert_own"
    on storage.objects
    for insert
    to authenticated
    with check (
      bucket_id = 'receipts'
      and owner = auth.uid()
    );

    create policy "receipts_update_own"
    on storage.objects
    for update
    to authenticated
    using (
      bucket_id = 'receipts'
      and owner = auth.uid()
    )
    with check (
      bucket_id = 'receipts'
      and owner = auth.uid()
    );

    create policy "receipts_delete_own"
    on storage.objects
    for delete
    to authenticated
    using (
      bucket_id = 'receipts'
      and owner = auth.uid()
    );
  exception
    when insufficient_privilege then
      raise notice 'Skipping storage policy setup: run this migration in Supabase SQL Editor as owner role.';
  end;
end $$;

commit;
