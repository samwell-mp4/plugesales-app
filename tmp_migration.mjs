import pkg from 'pg';
const { Pool } = pkg;

const pgUrl = process.env.DATABASE_URL || 'postgres://postgres:123456@localhost:5432/plugesales';
const pool = new Pool({ connectionString: pgUrl, ssl: false });

async function run() {
    try {
        console.log('Adding origin column...');
        await pool.query('ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS origin VARCHAR(50)');
        
        console.log('Migrating existing data...');
        // Heuristic: Status GERADO = TEMPLATE_CREATOR, everything else = CLIENT_FORM
        const resGerado = await pool.query("UPDATE client_submissions SET origin = 'TEMPLATE_CREATOR' WHERE status = 'GERADO' AND origin IS NULL");
        console.log(`Updated ${resGerado.rowCount} records to TEMPLATE_CREATOR`);
        
        const resClient = await pool.query("UPDATE client_submissions SET origin = 'CLIENT_FORM' WHERE status != 'GERADO' AND origin IS NULL");
        console.log(`Updated ${resClient.rowCount} records to CLIENT_FORM`);
        
        console.log('Success!');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

run();
