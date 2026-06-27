import { pool } from '../backend/database/db.js';

async function createUser() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            INSERT INTO users (name, email, password, role, notification_number)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (email) DO UPDATE SET 
                role = EXCLUDED.role, 
                notification_number = EXCLUDED.notification_number
            RETURNING *;
        `, ['Luciano Campos', 'luciano@plugsales.com.br', 'Luciano2026!', 'CLIENT', '553799167038']);
        console.log('User created or updated:', res.rows[0]);
    } catch (e) {
        console.error('Error creating user:', e);
    } finally {
        client.release();
        pool.end();
    }
}

createUser();
