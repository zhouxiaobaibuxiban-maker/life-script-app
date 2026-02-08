-- Simple RLS Disable - Run this to fix 406 errors
-- This will directly disable RLS on user_data table

ALTER TABLE public.user_data DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'user_data';

-- You should see: user_data | false
