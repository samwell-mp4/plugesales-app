import { pool } from '../backend/database/db.js';

async function main() {
    try {
        const queryStr = '%grilo%';
        const linksRes = await pool.query(
            `SELECT id, title, original_url, short_code FROM shortened_links 
             WHERE title ILIKE $1 OR original_url ILIKE $1 OR short_code ILIKE $1`, 
            [queryStr]
        );
        console.log('--- SHORTENED LINKS MATCHING "grilo" ---');
        console.table(linksRes.rows);

        const rotatorsRes = await pool.query(
            `SELECT id, title, slug FROM pro_rotators 
             WHERE title ILIKE $1 OR slug ILIKE $1`, 
            [queryStr]
        );
        console.log('--- PRO ROTATORS MATCHING "grilo" ---');
        console.table(rotatorsRes.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

main();
