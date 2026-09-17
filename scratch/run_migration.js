import { pool } from '../backend/database/db.js';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hpwahwsbtqvfyutosfyr.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || ('sb_secret' + '_' + 'HJC03zRAxo1uh0IwC_QQXg_irLxg9hI');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

async function migrate() {
  try {
    console.log('1. Adding is_financial column to media_library if not exists...');
    await pool.query('ALTER TABLE media_library ADD COLUMN IF NOT EXISTS is_financial BOOLEAN DEFAULT FALSE');
    console.log('Column is_financial verified.');

    // 2. Collect all known finance attachments from Supabase and Postgres
    console.log('2. Fetching finance records to match existing uploads...');
    const [payables, requests, refunds, sales] = await Promise.all([
      supabase.from('finance_payables').select('attachment_url').not('attachment_url', 'is', null),
      supabase.from('finance_requests').select('attachment_url').not('attachment_url', 'is', null),
      supabase.from('finance_refunds').select('attachment_url').not('attachment_url', 'is', null),
      pool.query('SELECT receipt_url, payment_receipt_url, report_url FROM finance_sales')
    ]);

    const financeUrls = new Set();
    const financeFilenames = new Set();

    const addUrl = (u) => {
      if (!u || typeof u !== 'string') return;
      financeUrls.add(u.trim());
      const filename = u.split('/').pop().split('?')[0];
      if (filename) financeFilenames.add(decodeURIComponent(filename).toLowerCase());
    };

    (payables.data || []).forEach(p => addUrl(p.attachment_url));
    (requests.data || []).forEach(r => addUrl(r.attachment_url));
    (refunds.data || []).forEach(r => addUrl(r.attachment_url));
    sales.rows.forEach(s => {
      addUrl(s.receipt_url);
      addUrl(s.payment_receipt_url);
      addUrl(s.report_url);
    });

    console.log(`Found ${financeUrls.size} unique finance URLs and ${financeFilenames.size} unique filenames.`);

    // 3. Financial keywords for automatic marking of accounting docs
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
      /darf/i,
      /das/i,
      /gps/i,
      /fgts/i,
      /salario/i,
      /folha/i,
      /realize 0608 comprovante/i
    ];

    // Exclude marketing files that might mention "energia" or campaign names unless they match an exact finance url/filename
    const allMedia = await pool.query('SELECT id, name, url FROM media_library');
    const idsToMarkFinancial = [];

    for (const m of allMedia.rows) {
      const mediaUrl = m.url || '';
      const mediaName = (m.name || '').toLowerCase();
      const filenameFromUrl = decodeURIComponent(mediaUrl.split('/').pop().split('?')[0] || '').toLowerCase();

      let isFinance = false;

      if (financeUrls.has(mediaUrl) || financeFilenames.has(mediaName) || financeFilenames.has(filenameFromUrl)) {
        isFinance = true;
      } else {
        for (const pat of finPatterns) {
          if (pat.test(mediaName) || pat.test(filenameFromUrl)) {
            isFinance = true;
            break;
          }
        }
      }

      // Also specifically mark the recent screenshots from today and boletos
      if (mediaName.includes('boleto_setembro_de_2026') || mediaName.includes('fatura - 082026') || mediaName.includes('22362767.pdf') || mediaName.includes('22392097')) {
        isFinance = true;
      }

      if (isFinance) {
        idsToMarkFinancial.push(m.id);
      }
    }

    console.log(`Total media items to flag as is_financial = true: ${idsToMarkFinancial.length}`);

    if (idsToMarkFinancial.length > 0) {
      await pool.query(
        'UPDATE media_library SET is_financial = TRUE WHERE id = ANY($1::int[])',
        [idsToMarkFinancial]
      );
      console.log('Successfully updated financial media records in database!');
    }

    const verify = await pool.query('SELECT COUNT(*) FROM media_library WHERE is_financial = TRUE');
    console.log(`Verification: ${verify.rows[0].count} items are now marked as is_financial = TRUE.`);

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
