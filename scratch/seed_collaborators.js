import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: 'postgres://postgres:123456@localhost:5432/plugesales' });
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Faltam variáveis do Supabase no .env");
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

const data = [
    { name: 'Augusto Fagundes', fullName: 'Augusto Martins de Assis Fagundes', cpf: '125.196.226-28', role: 'Gestor de Automação', bank: '', account: '', pix: '', phone: '', birth: '' },
    { name: 'Thales Henrique', fullName: 'Thales Henrique Fonseca Pereira', cpf: '129.483.626-95', role: 'Gerente Operacional', bank: '', account: '', pix: '31 975155601', phone: '31 975155601', birth: '1996-04-19' },
    { name: 'Italo Clovis', fullName: 'Italo Clóvis Alves Teixeira', cpf: '018.212.226-36', role: 'Gestor de Automação', bank: 'Sicoob (756)', account: '', pix: 'thaleshenrique121@hotmail.com', phone: '31 9233-0403', birth: '1995-12-09' },
    { name: 'Gabriel Martins', fullName: 'Gabriel Martins Santos', cpf: '022.523.236-71', role: 'Gestor de Automação', bank: 'Nubank (260)', account: 'Ag: 0001 CC: 4081892-2', pix: '31 98787-0338', phone: '31 98787-0338', birth: '1997-05-13' },
    { name: 'Ricardo Willer', fullName: 'Ricardo Willer de Alcântara Santos', cpf: '114.073.116-54', role: 'Gestor de Tráfego Pago', bank: 'Nubank (260)', account: 'Ag: 0001 CC: 34078876-7', pix: 'gabrielmartinssantos13@hotmail.com', phone: '31 98319-5398', birth: '1997-07-29' },
    { name: 'Samwell Souza', fullName: 'Samuel de Souza Alencar', cpf: '143.923.856-12', role: 'Gestor de Marketing', bank: 'Caixa (104)', account: 'Ag 1746 CP: 769893429-3', pix: '114.073.116-54', phone: '31 99373-7757', birth: '1996-05-03' },
    { name: 'Otávio Augusto', fullName: 'Otávio Augusto Firmiano Silva', cpf: '154.720.186-09', role: 'Gestor de Automação', bank: '', account: '', pix: '31 8886-8362', phone: '', birth: '1998-11-30' },
    { name: 'Lucas Maia', fullName: 'Lucas Maia Martins', cpf: '085.276.206-26', role: 'Gestor de Automação', bank: 'Nubank (260)', account: 'Ag: 0001 CC:743025521-5', pix: 'otavio.kouga@gmail.com', phone: '', birth: '2001-07-27' },
    { name: 'Gabriel Marcelino', fullName: 'Gabriel de Oliveira Marcelino', cpf: '194.914.386-46', role: 'Gestor de Automação', bank: 'Santander (033)', account: 'Ag: 1550 CC: 01029234-8', pix: '31991443722', phone: '31 99144-3722', birth: '1987-09-11' },
    { name: 'Joyce Vieira', fullName: 'Joyce de Oliveira Vieira', cpf: '125.164.646-81', role: 'Vendedora', bank: '', account: '', pix: 'gabrieloliveira130713@gmail.com', phone: '31 8346-7140', birth: '2006-07-13' },
    { name: 'Ramon Gomes', fullName: 'Ramon da Silva Gomes', cpf: '117.127.556-09', role: 'Gestor de Automação', bank: 'Mercado Pago (323)', account: 'Ag: 0001 CC: 4215454434-9', pix: '31 98108 1012', phone: '31 98108 1012', birth: '1995-04-12' },
    { name: 'Bernardo Rodrigues', fullName: 'Bernado Alecrim Rodrigues', cpf: '121.433.846-10', role: 'Gestor de Automação', bank: 'Nubank (260)', account: 'Ag: 0001 CC: 40375252-1', pix: '31 99640-4161', phone: '31 97509-0068', birth: '1993-12-25' },
    { name: 'Gelton Carlos', fullName: 'Gelton Carlos Alexandre', cpf: '154.142.776-99', role: 'Gestor de Automação', bank: '', account: '', pix: '31 99453-3717', phone: '31 99453-3717', birth: '1995-09-22' },
    { name: 'Fernanda Pinheiro', fullName: 'Fernanda Araújo Pinheiro', cpf: '124.932.566-89', role: 'COZINHEIRA', bank: 'INTER (77)', account: 'Ag: 0001 CC: 29170501-4', pix: '31 97327-5108', phone: '31 97327-5108', birth: '1998-10-05', email: 'fernanda@plugsales.com.br' },
    { name: 'Gisele Vieira', fullName: 'Gisele Vieira', cpf: '', role: 'VENDEDORA', bank: '', account: '', pix: '', phone: '', birth: '' }
];

async function seed() {
    try {
        console.log("Iniciando inserção...");
        for (const item of data) {
            // Find user in postgres
            let userRes;
            if (item.name === 'Fernanda Pinheiro') {
                userRes = await pool.query("INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role RETURNING id", [item.fullName, item.email, 'Cozinha2026!', 'COZINHEIRA']);
            } else {
                userRes = await pool.query("SELECT id, name FROM users WHERE name ILIKE $1 OR name ILIKE $2 LIMIT 1", [`%${item.name}%`, `%${item.fullName.split(' ')[0]}%`]);
            }
            
            if (userRes && userRes.rows.length > 0) {
                const pgId = userRes.rows[0].id;
                console.log(`Atualizando ${item.fullName} (ID Postgres: ${pgId})`);
                
                if (item.role === 'COZINHEIRA' || item.role === 'VENDEDORA') {
                    await pool.query("UPDATE users SET role = $1 WHERE id = $2", [item.role, pgId]);
                }

                // Parse bank / account
                let agency = '';
                let account = item.account;
                if (item.account.includes('Ag:')) {
                    const parts = item.account.split('CC:');
                    agency = parts[0].replace('Ag:', '').trim();
                    if (parts.length > 1) {
                        account = parts[1].trim();
                    }
                }

                const payload = {
                    id: pgId,
                    full_name: item.fullName,
                    cpf: item.cpf,
                    phone: item.phone,
                    role: item.role,
                    bank: item.bank,
                    agency: agency,
                    account: account,
                    pix_key: item.pix,
                    birth_date: item.birth || null
                };

                const { error } = await supabase.from('collaborators').upsert([payload]);
                if (error) {
                    console.error(`Erro no supabase para ${item.fullName}:`, error.message);
                }
            } else {
                console.log(`⚠️ Usuário não encontrado no DB Postgres para mapear: ${item.fullName}`);
            }
        }
        console.log("Concluído.");
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
seed();
