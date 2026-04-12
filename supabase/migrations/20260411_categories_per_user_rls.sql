-- Per-user categories only: backfill from shared rows, remap FKs, merge duplicates,
-- drop shared rows, tighten RLS, unique (user, name).

begin;

-- 1) Drop signup/category cloning function if present (stops duplicate templates per user).
do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'create_default_categories'
  loop
    execute 'drop function if exists ' || r.sig || ' cascade';
  end loop;
end $$;

-- 2) Private copy of each shared category (user_id IS NULL) for every auth user.
insert into public.categories (name, icon, color, is_default, user_id)
select gc.name, gc.icon, gc.color, false, u.id
from auth.users u
cross join public.categories gc
where gc.user_id is null
  and not exists (
    select 1
    from public.categories c2
    where c2.user_id = u.id
      and lower(trim(c2.name)) = lower(trim(gc.name))
  );

-- 3) Merge duplicate user-owned rows first so global→user remaps join a single id per (user, name).
with ranked as (
  select
    id,
    user_id,
    lower(trim(name)) as norm,
    row_number() over (
      partition by user_id, lower(trim(name))
      order by id
    ) as rn
  from public.categories
  where user_id is not null
    and name is not null
),
keepers as (
  select id as keeper_id, user_id, norm
  from ranked
  where rn = 1
),
losers as (
  select id as loser_id, user_id, norm
  from ranked
  where rn > 1
)
update public.expenses e
set category_id = k.keeper_id
from losers l
join keepers k on k.user_id = l.user_id and k.norm = l.norm
where e.category_id = l.loser_id;

with ranked as (
  select
    id,
    user_id,
    lower(trim(name)) as norm,
    row_number() over (
      partition by user_id, lower(trim(name))
      order by id
    ) as rn
  from public.categories
  where user_id is not null
    and name is not null
),
keepers as (
  select id as keeper_id, user_id, norm
  from ranked
  where rn = 1
),
losers as (
  select id as loser_id, user_id, norm
  from ranked
  where rn > 1
)
update public.expense_line_items li
set category_id = k.keeper_id
from losers l
join keepers k on k.user_id = l.user_id and k.norm = l.norm
where li.category_id = l.loser_id;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'budgets'
  ) then
    execute $b$
      with ranked as (
        select
          id,
          user_id,
          lower(trim(name)) as norm,
          row_number() over (
            partition by user_id, lower(trim(name))
            order by id
          ) as rn
        from public.categories
        where user_id is not null
          and name is not null
      ),
      keepers as (
        select id as keeper_id, user_id, norm
        from ranked
        where rn = 1
      ),
      losers as (
        select id as loser_id, user_id, norm
        from ranked
        where rn > 1
      )
      update public.budgets b
      set category_id = k.keeper_id
      from losers l
      join keepers k on k.user_id = l.user_id and k.norm = l.norm
      where b.category_id = l.loser_id;
    $b$;
  end if;
end $$;

delete from public.categories c
where c.id in (
  select id
  from (
    select
      id,
      row_number() over (
        partition by user_id, lower(trim(name))
        order by id
      ) as rn
    from public.categories
    where user_id is not null
      and name is not null
  ) sub
  where rn > 1
);

-- 4) Remap expenses from shared category rows to this user's row (same name).
--    (Target table e must not appear inside JOIN ON; correlate in WHERE only.)
update public.expenses e
set category_id = c_new.id
from public.categories c_old,
     public.categories c_new
where e.category_id = c_old.id
  and c_old.user_id is null
  and c_new.user_id = e.user_id
  and lower(trim(c_new.name)) = lower(trim(c_old.name));

-- 5) Remap line items (user comes from parent expense).
update public.expense_line_items li
set category_id = c_new.id
from public.expenses e,
     public.categories c_old,
     public.categories c_new
where li.expense_id = e.id
  and li.category_id = c_old.id
  and c_old.user_id is null
  and c_new.user_id = e.user_id
  and lower(trim(c_new.name)) = lower(trim(c_old.name));

-- 6) Budgets (optional table).
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'budgets'
  ) then
    execute $b$
      update public.budgets b
      set category_id = c_new.id
      from public.categories c_old,
           public.categories c_new
      where b.category_id = c_old.id
        and c_old.user_id is null
        and c_new.user_id = b.user_id
        and lower(trim(c_new.name)) = lower(trim(c_old.name));
    $b$;
  end if;
end $$;

-- 7) Remove shared category rows (no user_id).
delete from public.categories where user_id is null;

-- 8) RLS: only own rows.
drop policy if exists "categories_select_visible" on public.categories;

create policy "categories_select_own"
on public.categories
for select
to authenticated
using (user_id = auth.uid());

-- 9) One display name per user (case- and trim-insensitive).
create unique index if not exists idx_categories_user_lower_name
  on public.categories (user_id, (lower(trim(name))))
  where user_id is not null and name is not null;

commit;
