import pool from '../backend/database/db.js';

async function run() {
  try {
    const res = await pool.query('SELECT title, slug FROM blog_posts');
    console.log(res.rows);
  } catch(e) {
    console.log(e);
  } finally {
    pool.end();
  }
}
run();
