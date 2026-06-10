import { pool } from './backend/database/db.js';
pool.query(`SELECT email, password FROM users WHERE email IN ('testsamwell@gmail.com', 'sa@gmail.com', 'plugsales2026@gmail.com', 'admin@internal.system')`).then(res => {
    console.table(res.rows);
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
