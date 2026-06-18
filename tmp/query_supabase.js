import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hpwahwsbtqvfyutosfyr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwd2Fod3NidHF2Znl1dG9zZnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5OTIzMTYsImV4cCI6MjA5MDU2ODMxNn0.EVjz7dCcowbnLiRFb8ODBvyx4BAQajdvwnzOwGgyHPk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase
    .from('users')
    .select('name, infobip_key, infobip_sender, infobip_url')
    .ilike('name', '%sidao%');
    
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Results for sidao:", data);
  }

  const { data: data2, error: error2 } = await supabase
    .from('users')
    .select('name, infobip_key, infobip_sender, infobip_url')
    .ilike('name', '%sidão%');
    
  if (error2) {
    console.error("Error2:", error2);
  } else {
    console.log("Results for sidão:", data2);
  }
}
run();
