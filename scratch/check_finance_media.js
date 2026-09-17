import { pool } from '../backend/database/db.js';

async function test() {
  try {
    // Check sales receipt URLs
    const sales = await pool.query("SELECT receipt_url, payment_receipt_url, report_url FROM finance_sales WHERE receipt_url IS NOT NULL OR payment_receipt_url IS NOT NULL OR report_url IS NOT NULL");
    console.log("Sales with attachments:", sales.rows.length);

    // Check how many media_library items match those URLs or filenames
    const urls = new Set();
    sales.rows.forEach(r => {
      if (r.receipt_url) urls.add(r.receipt_url);
      if (r.payment_receipt_url) urls.add(r.payment_receipt_url);
      if (r.report_url) urls.add(r.report_url);
    });

    console.log("Unique sales attachment URLs:", urls.size);

    // Let's also check supabase finance_payables, finance_requests, etc. if accessible or what other tables exist
    // Let's check names in media_library
    const finKeywords = ['comprovante', 'boleto', 'recibo', 'pagamento', 'nota', 'nf', 'fiscal', 'fatura', 'pix', 'salario', 'adiantamento', 'reembolso'];
    const keywordQuery = finKeywords.map((k, i) => `name ILIKE $${i + 1}`).join(' OR ');
    const matchedNames = await pool.query(`SELECT COUNT(*) FROM media_library WHERE ${keywordQuery}`, finKeywords.map(k => `%${k}%`));
    console.log("Matched by finance keyword in name:", matchedNames.rows[0].count);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

test();
