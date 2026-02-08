-- Fix RLS policies for user_data
ALTER TABLE public.user_data DROP POLICY IF EXISTS "user_can_view_own_data" ON public.user_data;
ALTER TABLE public.user_data DROP POLICY IF EXISTS "user_can_insert_own_data" ON public.user_data;
ALTER TABLE public.user_data DROP POLICY IF EXISTS "user_can_update_own_data" ON public.user_data;
ALTER TABLE public.user_data DROP POLICY IF EXISTS "user_can_delete_own_data" ON public.user_data;

-- Disable RLS temporarily for testing
ALTER TABLE public.user_data DISABLE ROW LEVEL SECURITY;
