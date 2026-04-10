-- Harden public functions by pinning their search_path.
-- This removes Supabase "Function Search Path Mutable" warnings without needing exact signatures.

do $$
declare
  function_name text;
  function_record record;
begin
  foreach function_name in array array[
    'get_spending_by_category',
    'get_monthly_spending',
    'get_daily_spending',
    'get_budget_progress',
    'handle_new_user',
    'update_updated_at',
    'create_default_categories'
  ]
  loop
    for function_record in
      select p.oid::regprocedure as signature
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname = function_name
    loop
      execute format('alter function %s set search_path = public', function_record.signature);
    end loop;
  end loop;
end $$;
