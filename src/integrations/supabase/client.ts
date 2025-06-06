
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hwruumqduuiivmaxgtfn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cnV1bXFkdXVpaXZtYXhndGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4ODI0MzEsImV4cCI6MjA2MjQ1ODQzMX0.QExNuAfxDZVXXJvmoIklOSvVJj3ddeeDaS_6RpWx3bY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY, 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);
