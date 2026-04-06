
import pg from 'pg';
const { Pool } = pg;

const pgUrl = "postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/plug_sales_dispatch_app?sslmode=disable";
const pool = new Pool({ connectionString: pgUrl });

async function checkConstraints() {
    const res = await pool.query("SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'plug_cards'::regclass");
    console.log(JSON.stringify(res.rows, null, 2));
    await pool.end();
}

checkConstraints();
