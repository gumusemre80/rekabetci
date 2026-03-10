import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail fast if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("FATAL: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing. Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
