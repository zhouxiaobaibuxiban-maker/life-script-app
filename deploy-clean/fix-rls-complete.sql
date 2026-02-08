-- Complete RLS Fix for user_data table
-- This will disable RLS temporarily to allow testing

-- Drop all existing policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_data'
  ) THEN
    DROP POLICY IF EXISTS "user_can_view_own_data" ON public.user_data;
    DROP POLICY IF EXISTS "user_can_insert_own_data" ON public.user_data;
    DROP POLICY IF EXISTS "user_can_update_own_data" ON public.user_data;
    DROP POLICY IF EXISTS "user_can_delete_own_data" ON public.user_data;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_data;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_data;
    DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_data;
    DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.user_data;
  END IF;
END $$;

-- Disable RLS completely for testing
ALTER TABLE public.user_data DISABLE ROW LEVEL SECURITY;

-- Verify the change
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'user_data';
