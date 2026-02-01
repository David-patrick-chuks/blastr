import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
    console.warn('Supabase credentials missing. Database features may not work.');
}

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
