import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and Anon Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Basic validation
if (!supabaseUrl) {
  console.error("Error: VITE_SUPABASE_URL is not defined in .env file");
  throw new Error("Supabase URL not configured.");
}
if (!supabaseAnonKey) {
  console.error("Error: VITE_SUPABASE_ANON_KEY is not defined in .env file");
  throw new Error("Supabase Anon Key not configured.");
}

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("Supabase client initialized."); // Log for confirmation
