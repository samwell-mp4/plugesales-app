import pg from 'pg';

const pgUrl = "postgres://postgres:123456@localhost:5432/plugesales";
const { Pool } = pg;
const pool = new Pool({ connectionString: pgUrl });

async function seed() {
    try {
        console.log('🚀 Cadastrando Anderson Maia...');
        
        const check = await pool.query('SELECT id FROM users WHERE email = $1', ['anderson.maia@plugsales.com.br']);
        
        if (check.rows.length === 0) {
            await pool.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
                ['Anderson Maia', 'anderson.maia@plugsales.com.br', 'Plugsales2026', 'EMPLOYEE']
            );
            console.log('✅ Adicionado: Anderson Maia | Senha: Plugsales2026');
        } else {
            // Update password just in case
            await pool.query(
                'UPDATE users SET password = $1 WHERE email = $2',
                ['Plugsales2026', 'anderson.maia@plugsales.com.br']
            );
            console.log('ℹ️ Atualizado: Anderson Maia | Senha: Plugsales2026');
        }
        
    } catch (err) {
        console.error('❌ Erro no seed:', err);
    } finally {
        await pool.end();
    }
}

seed();
