import { pool } from '../backend/database/db.js';

async function run() {
    try {
        console.log("Checking and upgrading finance_sales table...");
        await pool.query(`
            ALTER TABLE finance_sales 
            ADD COLUMN IF NOT EXISTS receipt_url TEXT,
            ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;
        `);
        console.log("✅ Columns receipt_url and payment_receipt_url added or verified successfully in finance_sales table.");
    } catch (err) {
        console.error("❌ Error upgrading finance_sales table:", err);
    } finally {
        await pool.end();
    }
}

run();
