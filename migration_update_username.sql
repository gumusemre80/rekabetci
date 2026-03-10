-- RPC function to update username securely (bypasses RLS with SECURITY DEFINER)
-- Run this in the Supabase Dashboard SQL Editor

CREATE OR REPLACE FUNCTION public.update_username(p_user_id UUID, p_new_username TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles 
    SET username = p_new_username 
    WHERE id = p_user_id;
END;
$$;
