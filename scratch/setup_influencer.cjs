const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/plug_sales_dispatch_app?sslmode=disable' });

async function run() {
    try {
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS crm_spreadsheet_id TEXT');
        const sql = 'INSERT INTO users (name, email, phone, password, role, crm_spreadsheet_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
        const res = await pool.query(sql, ['Matheus Borges', 'matheus@influencer.com', '5511999999999', 'matheus123', 'INFLUENCER', '1Kyg2H01DDrfR-bR_tBM_vDDXXvWaqk-61QbivSWZFV4']);
        console.log('Influencer Matheus criado com ID:', res.rows[0].id);
    } catch(e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
