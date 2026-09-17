import { pool } from '../backend/database/db.js';

async function checkRecent() {
  const res = await pool.query('SELECT id, name, type, url, created_at FROM media_library WHERE id >= 7120 ORDER BY id DESC');
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit(0);
}

checkRecent();
