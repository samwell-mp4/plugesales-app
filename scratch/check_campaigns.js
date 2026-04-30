import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: "postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/plug_sales_dispatch_app?sslmode=disable"
});

async function check() {
    try {
        const res = await pool.query(`
            SELECT campanha, count(*) as total, count(DISTINCT remetente) as unique_senders 
            FROM public.data_log 
            GROUP BY campanha
        `);
        console.table(res.rows);
        
        const sample = await pool.query(`SELECT remetente, destinatario, campanha FROM public.data_log LIMIT 10`);
        console.log("Sample rows:");
        console.table(sample.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
