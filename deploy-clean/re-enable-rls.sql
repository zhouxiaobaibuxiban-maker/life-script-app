-- Re-enable RLS with proper policies for user_data table
-- Run this AFTER testing is complete to secure your database

-- First, make sure RLS is enabled
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow view own data" ON public.user_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow insert own data" ON public.user_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update own data" ON public.user_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow delete own data" ON public.user_data
  FOR DELETE USING (auth.uid() = user_id);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_data';
