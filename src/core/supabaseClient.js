import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Throw a descriptive error if variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase Error: VITE_SUPABASE_URL properties missing. Please update your .env file.");
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
