require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query('SELECT id, profile_name, user_id, submitted_role, submitted_by FROM client_submissions ORDER BY id DESC LIMIT 15')
  .then(r => { r.rows.forEach(row => console.log(JSON.stringify(row))); pool.end(); })
  .catch(e => { console.log('ERROR:', e.message); pool.end(); });
