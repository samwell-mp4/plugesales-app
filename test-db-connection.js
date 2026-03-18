import pg from 'pg';
import { createClient } from 'redis';

const pgUrl = "postgres://postgres:Marketing@plugsales2026!@plug_sales_dispatch_app_plug_sales_postgress:5432/plug_sales_dispatch_app?sslmode=disable";
const redisUrl = "redis://default:Marketing@plugsales2026!@plug_sales_dispatch_app_plug_sales_redis:6379";

async function testConnections() {
    console.log("--- Testing PostgreSQL ---");
    const { Pool } = pg;
    const pool = new Pool({ connectionString: pgUrl });
    
    try {
        const res = await pool.query('SELECT NOW()');
        console.log("PostgreSQL Connected! Time:", res.rows[0].now);
        await pool.end();
    } catch (err) {
        console.error("PostgreSQL Connection Error:", err.message);
    }

    console.log("\n--- Testing Redis ---");
    const client = createClient({ url: redisUrl });
    client.on('error', (err) => console.log('Redis Client Error', err));

    try {
        await client.connect();
        await client.set('test_key', 'Hello from Node.js');
        const value = await client.get('test_key');
        console.log("Redis Connected! Test value:", value);
        await client.quit();
    } catch (err) {
        console.error("Redis Connection Error:", err.message);
    }
}

testConnections();
