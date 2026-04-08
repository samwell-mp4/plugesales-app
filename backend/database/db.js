import pg from 'pg';
import fs from 'fs';

const DEFAULT_PG = "postgres://postgres:Marketing@plugsales2026!@plug_sales_dispatch_app_plug_sales_postgress:5432/plug_sales_dispatch_app?sslmode=disable";
const LOCAL_PG = "postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/plug_sales_dispatch_app?sslmode=disable";

let pgUrl = process.env.DATABASE_URL;

if (!pgUrl) {
    if (fs.existsSync('/.dockerenv')) {
        pgUrl = DEFAULT_PG;
    } else {
        pgUrl = LOCAL_PG;
    }
}

if (fs.existsSync('/.dockerenv')) {
    if (pgUrl.includes('localhost') || pgUrl.includes('127.0.0.1')) {
        pgUrl = DEFAULT_PG;
    }
}

const { Pool } = pg;
export const pool = new Pool({ connectionString: pgUrl, connectionTimeoutMillis: 5000 });
export default pool;
