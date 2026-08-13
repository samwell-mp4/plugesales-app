const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/plug_sales_dispatch_app?sslmode=disable'
});

async function run() {
    try {
        console.log("Checking and upgrading finance_sales table...");
        await pool.query(`
            ALTER TABLE finance_sales 
            ADD COLUMN IF NOT EXISTS receipt_url TEXT,
            ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT,
            ADD COLUMN IF NOT EXISTS report_url TEXT,
            ADD COLUMN IF NOT EXISTS notes TEXT;
        `);
        console.log("✅ Columns receipt_url, payment_receipt_url, report_url, and notes added or verified successfully.");
    } catch (err) {
        console.error("❌ Error upgrading finance_sales table:", err);
    } finally {
        await pool.end();
    }
}

run();
