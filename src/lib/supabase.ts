import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hpwahwsbtqvfyutosfyr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwd2Fod3NidHF2Znl1dG9zZnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5OTIzMTYsImV4cCI6MjA5MDU2ODMxNn0.EVjz7dCcowbnLiRFb8ODBvyx4BAQajdvwnzOwGgyHPk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
