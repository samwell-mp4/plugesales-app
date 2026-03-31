import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hpwahwsbtqvfyutosfyr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9UgYwVdsw8AkBSOKHCs-Qg_xzbpNdqp';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
