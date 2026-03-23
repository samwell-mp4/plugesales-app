import fs from 'fs';
import pg from 'pg';

async function check() {
    try {
        const serverContent = fs.readFileSync('c:/Users/Usuario/Plug & Sales/server.js', 'utf8');
        const match = serverContent.match(/const LOCAL_PG = "(.*?)"/);
        if (!match) {
            console.log('LOCAL_PG not found in server.js');
            return;
        }
        
        const connectionString = match[1];
        const { Pool } = pg;
        const pool = new Pool({ connectionString });
        
        const res = await pool.query("SELECT name, email, password, role FROM users WHERE role IN ('ADMIN', 'EMPLOYEE')");
        console.table(res.rows);
        await pool.end();
    } catch (err) {
        console.error(err);
    }
}

check();
