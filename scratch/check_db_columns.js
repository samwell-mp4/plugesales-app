import pg from 'pg';
import { pgUrl } from '../backend/database/db.js';

const { Pool } = pg;
const pool = new Pool({ connectionString: pgUrl });

async function check() {
    try {
        console.log("Checking columns for users and finance_sales...");
        const usersRes = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        console.log("\n--- USERS COLUMNS ---");
        console.table(usersRes.rows);

        const salesRes = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'finance_sales'
        `);
        console.log("\n--- FINANCE_SALES COLUMNS ---");
        console.table(salesRes.rows);

        const configRes = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'salesperson_configs'
        `);
        console.log("\n--- SALESPERSON_CONFIGS COLUMNS ---");
        console.table(configRes.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
check();
