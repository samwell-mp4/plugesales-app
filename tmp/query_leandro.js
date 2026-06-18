import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/plugesales' }); 
pool.query(`SELECT name, infobip_key, infobip_sender FROM users WHERE name ILIKE '%Leandro%'`)
  .then(res => console.log(res.rows))
  .catch(console.error)
  .finally(()=>pool.end());
