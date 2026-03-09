-- 1. Create a function to securely lookup an email by username
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_email TEXT;
BEGIN
    SELECT au.email INTO v_email
    FROM auth.users au
    JOIN public.profiles p ON p.id = au.id
    WHERE p.username = p_username
    LIMIT 1;
    
    RETURN v_email;
END;
$$;

-- 2. Update the handle_new_user trigger to allow custom usernames
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, account_type)
  VALUES (
    new.id, 
    -- Use the username from metadata if provided, otherwise default to email prefix
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    'Standart'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
