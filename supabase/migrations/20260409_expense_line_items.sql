-- Line items for split receipt expenses (per-line category / budget allocation)

begin;

create table if not exists public.expense_line_items (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses (id) on delete cascade,
  name text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  category_id uuid references public.categories (id) on delete set null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_expense_line_items_expense_id
  on public.expense_line_items (expense_id);

create index if not exists idx_expense_line_items_category_id
  on public.expense_line_items (category_id);

create index if not exists idx_expense_line_items_expense_position
  on public.expense_line_items (expense_id, position);

alter table public.expense_line_items enable row level security;

drop policy if exists "expense_line_items_select_own" on public.expense_line_items;
drop policy if exists "expense_line_items_insert_own" on public.expense_line_items;
drop policy if exists "expense_line_items_update_own" on public.expense_line_items;
drop policy if exists "expense_line_items_delete_own" on public.expense_line_items;

create policy "expense_line_items_select_own"
on public.expense_line_items
for select
to authenticated
using (
  exists (
    select 1
    from public.expenses e
    where e.id = expense_line_items.expense_id
      and e.user_id = auth.uid()
  )
);

create policy "expense_line_items_insert_own"
on public.expense_line_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.expenses e
    where e.id = expense_line_items.expense_id
      and e.user_id = auth.uid()
  )
);

create policy "expense_line_items_update_own"
on public.expense_line_items
for update
to authenticated
using (
  exists (
    select 1
    from public.expenses e
    where e.id = expense_line_items.expense_id
      and e.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.expenses e
    where e.id = expense_line_items.expense_id
      and e.user_id = auth.uid()
  )
);

create policy "expense_line_items_delete_own"
on public.expense_line_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.expenses e
    where e.id = expense_line_items.expense_id
      and e.user_id = auth.uid()
  )
);

commit;
