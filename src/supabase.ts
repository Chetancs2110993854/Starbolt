// src/supabase.ts

import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// Use appropriate environment access depending on your build tool
const supabaseUrl: string = process.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey: string = process.env.VITE_SUPABASE_ANON_KEY as string;

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };
