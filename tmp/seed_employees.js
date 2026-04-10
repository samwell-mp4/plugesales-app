import pg from 'pg';

const pgUrl = "postgres://postgres:123456@localhost:5432/plugesales";
const { Pool } = pg;
const pool = new Pool({ connectionString: pgUrl });

const employees = [
    { name: 'Ricardo Willer', email: 'ricardowiller@plugsales.com.br' },
    { name: 'Otávio Augusto', email: 'otavioaugusto@plugsales.com.br' },
    { name: 'Augusto Fagundes', email: 'augustofagundes@plugsales.com.br' },
    { name: 'Luis Henrique', email: 'luishenrique@plugsales.com.br' },
    { name: 'Gabriel Martins', email: 'gabrielmartins@plugsales.com.br' },
    { name: 'Italo Clovis', email: 'italoclovis@plugsales.com.br' },
    { name: 'Samwell Souza', email: 'samwellsouza@plugsales.com.br' },
    { name: 'Thales Henrique', email: 'thaleshenrique@plugsales.com.br' },
    { name: 'Ramon Gomes', email: 'ramongomes@plugsales.com.br', password: 'Ramon@plugsales2026!' },
    { name: 'Gisele Vieira', email: 'giselevieira@plugsales.com.br' }
];

const generatePassword = () => {
    return Math.random().toString(36).slice(-8).toUpperCase();
};

async function seed() {
    try {
        console.log('🚀 Iniciando cadastro de funcionários oficiais...');
        
        // 1. Migração: Adicionar coluna agent_name em step_leads caso não exista
        await pool.query('ALTER TABLE step_leads ADD COLUMN IF NOT EXISTS agent_name TEXT');
        console.log('✅ Tabela step_leads atualizada (agent_name adicionado).');

        for (const emp of employees) {
            const password = emp.password || generatePassword();
            const check = await pool.query('SELECT id FROM users WHERE email = $1', [emp.email]);
            
            if (check.rows.length === 0) {
                await pool.query(
                    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
                    [emp.name, emp.email, password, 'EMPLOYEE']
                );
                console.log(`✅ Adicionado: ${emp.name} | Email: ${emp.email} | Senha: ${password}`);
            } else {
                console.log(`ℹ️ Pulado (já existe): ${emp.name}`);
            }
        }
        
        console.log('\n✨ Todos os funcionários oficiais foram processados.');
    } catch (err) {
        console.error('❌ Erro no seed:', err);
    } finally {
        await pool.end();
    }
}

seed();
