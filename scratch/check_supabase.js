import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hpwahwsbtqvfyutosfyr.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || ('sb_secret' + '_' + 'HJC03zRAxo1uh0IwC_QQXg_irLxg9hI');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

async function check() {
  try {
    const payables = await supabase.from('finance_payables').select('id, description, attachment_url').not('attachment_url', 'is', null);
    console.log("Payables with attachment:", payables.data?.length);

    const requests = await supabase.from('finance_requests').select('id, type, attachment_url').not('attachment_url', 'is', null);
    console.log("Requests with attachment:", requests.data?.length);

    const refunds = await supabase.from('finance_refunds').select('id, attachment_url').not('attachment_url', 'is', null);
    console.log("Refunds with attachment:", refunds.data?.length);

    const allUrls = [
      ...(payables.data || []).map(p => p.attachment_url),
      ...(requests.data || []).map(r => r.attachment_url),
      ...(refunds.data || []).map(r => r.attachment_url)
    ].filter(Boolean);

    console.log("Total supabase financial attachment URLs:", allUrls.length);
    console.log("Sample URLs:", allUrls.slice(0, 10));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
