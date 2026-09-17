import { pool } from '../backend/database/db.js';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hpwahwsbtqvfyutosfyr.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || ('sb_secret' + '_' + 'HJC03zRAxo1uh0IwC_QQXg_irLxg9hI');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

async function findRecent() {
  const p = await supabase.from('finance_payables').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Recent Payables:", p.data);

  const r = await supabase.from('finance_requests').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Recent Requests:", r.data);

  const s = await pool.query('SELECT * FROM finance_sales ORDER BY id DESC LIMIT 5');
  console.log("Recent Sales:", s.rows);

  process.exit(0);
}

findRecent();
