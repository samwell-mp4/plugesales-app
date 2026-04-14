const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/plug_sales_dispatch_app?sslmode=disable' });

const run = async () => {
    try {
        const sql = 'INSERT INTO users (name, email, phone, password, role, parent_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
        const res = await pool.query(sql, ['Jefferson Prime', 'jefferson@prime.com', '5511999999999', 'jefferson123', 'CLIENT', null]);
        console.log('Novo Usuário Criado com ID:', res.rows[0].id);
    } catch (err) {
        console.error('Error creating user:', err);
    } finally {
        await pool.end();
    }
};

run();
