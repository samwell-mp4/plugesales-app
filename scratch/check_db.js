import { pool } from '../backend/database/db.js';

async function main() {
  try {
    const t = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log("Tables:", t.rows.map(r => r.table_name));

    // Check media_library columns
    const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'media_library'");
    console.log("media_library columns:", cols.rows);

    // Check if there is an is_financial or source column
    // Check finance tables for receipt urls
    const salesUrls = await pool.query("SELECT id, receipt_url, payment_receipt_url, report_url FROM finance_sales WHERE receipt_url IS NOT NULL OR payment_receipt_url IS NOT NULL LIMIT 5");
    console.log("Sales URLs sample:", salesUrls.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
