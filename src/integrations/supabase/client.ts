// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://plndcglazhlcwuamplka.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsbmRjZ2xhemhsY3d1YW1wbGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3OTEyNTUsImV4cCI6MjA0OTM2NzI1NX0.i0sXzOg2nJ7g1_uBZ9i0wjyTNjHcb7nPdGppV_9YY-g";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);