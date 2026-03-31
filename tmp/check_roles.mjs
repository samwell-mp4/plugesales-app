import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;
dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const r = await pool.query('SELECT id, profile_name, user_id, submitted_role, submitted_by FROM client_submissions ORDER BY id DESC LIMIT 15');
r.rows.forEach(row => console.log(JSON.stringify(row)));
await pool.end();
