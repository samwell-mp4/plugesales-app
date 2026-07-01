import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: 'postgres://postgres:123456@localhost:5432/plugesales' });

pool.query("SELECT id, name, email, role FROM users WHERE role IN ('EMPLOYEE', 'ADMIN')")
  .then(res => { console.log(JSON.stringify(res.rows, null, 2)); pool.end(); })
  .catch(err => { console.error(err); pool.end(); });
