import { pool } from './backend/database/db.js';
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'").then(res => { console.log(res.rows.map(r => r.table_name)); process.exit(0); }).catch(e => console.error(e));
