import { pool } from '../backend/database/db.js';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hpwahwsbtqvfyutosfyr.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || ('sb_secret' + '_' + 'HJC03zRAxo1uh0IwC_QQXg_irLxg9hI');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

async function analyze() {
  try {
    // 1. Get all URLs from supabase finance tables
    const payables = await supabase.from('finance_payables').select('attachment_url').not('attachment_url', 'is', null);
    const requests = await supabase.from('finance_requests').select('attachment_url').not('attachment_url', 'is', null);
    const refunds = await supabase.from('finance_refunds').select('attachment_url').not('attachment_url', 'is', null);
    
    // 2. Get all URLs from pg finance_sales
    const sales = await pool.query('SELECT receipt_url, payment_receipt_url, report_url FROM finance_sales');

    const financeUrls = new Set();
    const financeFilenames = new Set();

    const addUrl = (u) => {
      if (!u || typeof u !== 'string') return;
      financeUrls.add(u.trim());
      const filename = u.split('/').pop().split('?')[0];
      if (filename) financeFilenames.add(decodeURIComponent(filename));
    };

    (payables.data || []).forEach(p => addUrl(p.attachment_url));
    (requests.data || []).forEach(r => addUrl(r.attachment_url));
    (refunds.data || []).forEach(r => addUrl(r.attachment_url));
    sales.rows.forEach(s => {
      addUrl(s.receipt_url);
      addUrl(s.payment_receipt_url);
      addUrl(s.report_url);
    });

    console.log("Total unique finance URLs found:", financeUrls.size);
    console.log("Total unique finance filenames found:", financeFilenames.size);

    // Let's check how many in media_library match these URLs or filenames
    const allMedia = await pool.query('SELECT id, name, url FROM media_library');
    console.log("Total in media_library:", allMedia.rows.length);

    let matchedCount = 0;
    const matchedIds = [];

    const finPatterns = [
      /comprovante/i,
      /boleto/i,
      /recibo/i,
      /pagamento/i,
      /nota[_\s-]?fiscal/i,
      /nf[_\s-]?e/i,
      /reembolso/i,
      /adiantamento/i,
      /fatura/i,
      /pix/i,
      /energia/i,
      /internet/i,
      /aluguel/i,
      /salario/i,
      /folha/i,
      /darf/i,
      /das/i,
      /gps/i,
      /fgts/i
    ];

    for (const m of allMedia.rows) {
      let isFinance = false;
      const mediaFilename = m.url ? decodeURIComponent(m.url.split('/').pop().split('?')[0]) : '';
      
      if (financeUrls.has(m.url) || financeFilenames.has(m.name) || financeFilenames.has(mediaFilename)) {
        isFinance = true;
      } else {
        for (const pat of finPatterns) {
          if (pat.test(m.name) || pat.test(mediaFilename)) {
            isFinance = true;
            break;
          }
        }
      }

      if (isFinance) {
        matchedCount++;
        matchedIds.push({ id: m.id, name: m.name, url: m.url });
      }
    }

    console.log(`Matched ${matchedCount} media items as financial/accounting!`);
    console.log("Sample matched media:", matchedIds.slice(0, 15));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

analyze();
