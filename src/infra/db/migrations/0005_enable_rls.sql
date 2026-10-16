-- Close Supabase's Data API (PostgREST) over our tables.
--
-- The app never reads tables through supabase-js: it connects as `postgres`
-- (which bypasses RLS) and authorizes in code (src/lib/auth-guards.ts). But the
-- publishable key ships to the browser, and with RLS disabled the `anon` and
-- `authenticated` roles could read and write every table through /rest/v1.
-- Enabling RLS with NO policies denies those roles everything and leaves the
-- app's own connection untouched.
--
-- Loops over every table in `public` so none is missed. Tables created by later
-- migrations need their own `ENABLE ROW LEVEL SECURITY`.
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END
$$;
