import pg from 'pg';
// Força a URL de produção/Docker para o teste direto se estiver no ambiente certo, 
// ou tenta a local se estiver local.
const pgUrl = "postgres://postgres:Marketing@plugsales2026!@plug_sales_dispatch_app_plug_sales_postgress:5432/plug_sales_dispatch_app?sslmode=disable";
const pool = new pg.Pool({ connectionString: pgUrl });

async function check() {
    try {
        console.log("Checking for short_code: samwellmidia.com.br");
        const res = await pool.query("SELECT * FROM shortened_links WHERE short_code = 'samwellmidia.com.br' OR original_url LIKE '%samwellmidia%';");
        console.log("Results found:", res.rows.length);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error("Query Error:", e.message);
    } finally {
        await pool.end();
    }
}
check();
