import pg from 'pg';

const pgUrl = "postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/plug_sales_dispatch_app?sslmode=disable";
const { Pool } = pg;
const pool = new Pool({ connectionString: pgUrl, connectionTimeoutMillis: 10000 });

async function seed() {
    try {
        console.log('🚀 Cadastrando Anderson Maia (DB Remoto)...');
        
        const email = 'anderson.maia@plugsales.com.br';
        const name = 'Anderson Maia';
        const pass = 'Plugsales2026';
        
        const check = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        
        if (check.rows.length === 0) {
            await pool.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
                [name, email, pass, 'EMPLOYEE']
            );
            console.log('✅ Adicionado no DB: Anderson Maia');
        } else {
            await pool.query(
                'UPDATE users SET password = $1 WHERE email = $2',
                [pass, email]
            );
            console.log('ℹ️ Atualizado no DB: Anderson Maia (Senha resetada)');
        }
        
    } catch (err) {
        console.error('❌ Erro no seed:', err);
    } finally {
        await pool.end();
    }
}

seed();
