import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import pg from 'pg';
import { createClient } from 'redis';
import OpenAI from 'openai';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// --- DB CONFIG ---
// Priority: 1. ENV vars, 2. Easypanel fallbacks (if in Docker), 3. Local individual fallbacks
const DEFAULT_PG = "postgres://postgres:Marketing@plugsales2026!@plug_sales_dispatch_app_plug_sales_postgress:5432/plug_sales_dispatch_app?sslmode=disable";
const DEFAULT_REDIS = "redis://default:Marketing@plugsales2026!@plug_sales_dispatch_app_plug_sales_redis:6379";
const LOCAL_PG = "postgres://postgres:123456@localhost:5432/plugesales";
const LOCAL_REDIS = "redis://localhost:6379";

let pgUrl = process.env.DATABASE_URL;
let redisUrl = process.env.REDIS_URL;

if (!pgUrl) {
    if (fs.existsSync('/.dockerenv')) {
        pgUrl = DEFAULT_PG;
    } else {
        pgUrl = LOCAL_PG;
    }
}

if (!redisUrl) {
    if (fs.existsSync('/.dockerenv')) {
        redisUrl = DEFAULT_REDIS;
    } else {
        redisUrl = LOCAL_REDIS;
    }
}

// CORREÇÃO CRÍTICA DE VPS/DOCKER: 
// Se detectarmos que estamos dentro de um contêiner (Docker), mas a URL capturada 
// for localhost/127.0.0.1, ignoramos e forçamos o hostname interno do Docker. 
// Isso resolve o erro de REDIS_URL/DATABASE_URL errados no painel do Easypanel.
if (fs.existsSync('/.dockerenv')) {
    if (pgUrl.includes('localhost') || pgUrl.includes('127.0.0.1')) {
        console.warn('⚠️ VPS DETECTADA: Corrigindo PG_URL de localhost para host interno do Docker.');
        pgUrl = DEFAULT_PG;
    }
    if (redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1')) {
        console.warn('⚠️ VPS DETECTADA: Corrigindo REDIS_URL de localhost para host interno do Docker.');
        redisUrl = DEFAULT_REDIS;
    }
}

console.log('Postgres connection source:', process.env.DATABASE_URL ? 'env' : (pgUrl === DEFAULT_PG ? 'docker fallback' : 'local fallback'));
console.log('Redis connection source:', process.env.REDIS_URL ? 'env' : (redisUrl === DEFAULT_REDIS ? 'docker fallback' : 'local fallback'));
console.log('PG URL (masked):', pgUrl.replace(/:[^:@]+@/, ':****@'));

const { Pool } = pg;
const pool = new Pool({ connectionString: pgUrl });

const redisClient = createClient({ url: redisUrl });
redisClient.on('error', err => console.error('Redis Client Error:', err));

const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log('✅ Redis connected successfully.');
        }
    } catch (e) {
        console.warn(`❌ Redis connection failed: ${e.message}. Retrying in 5s...`);
        setTimeout(connectRedis, 5000);
    }
};

// Inicia a conexão em segundo plano (não trava o boot do servidor Express)
connectRedis();

// Initialize Database Tables
const initDB = async () => {
    let client;
    try {
        client = await pool.connect();
        const tables = [
            `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`,
            `CREATE TABLE IF NOT EXISTS media_library (
                id SERIAL PRIMARY KEY, name TEXT, type TEXT, url TEXT, short_url TEXT, 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS audit_logs (
                id SERIAL PRIMARY KEY, log_type TEXT, author TEXT, name TEXT, template TEXT, mode TEXT, 
                total INTEGER DEFAULT 0, success INTEGER DEFAULT 0, transmission_id TEXT, 
                campaign_name TEXT, step_index INTEGER, user_id INTEGER, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS client_reports (
                id SERIAL PRIMARY KEY, user_id INTEGER, submission_id INTEGER, report_name TEXT, filename TEXT, 
                data JSONB, summary JSONB, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS contacts_list (
                id SERIAL PRIMARY KEY, tag TEXT UNIQUE, data JSONB, count INTEGER DEFAULT 0, 
                validator TEXT, creator TEXT DEFAULT 'Admin', status TEXT DEFAULT 'CONCLUÍDO', 
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS upload_history (
                id SERIAL PRIMARY KEY, tag TEXT, count INTEGER DEFAULT 0, validator TEXT, 
                creator TEXT DEFAULT 'Admin', status TEXT DEFAULT 'CONCLUÍDO', 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS campaigns (
                id SERIAL PRIMARY KEY, name TEXT, steps JSONB, 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS engine_logs (
                id SERIAL PRIMARY KEY, transmission_id TEXT, log_type TEXT, waba TEXT, 
                recipient TEXT, message TEXT, payload JSONB, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS planner_drafts (
                id SERIAL PRIMARY KEY, data JSONB, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'CLIENT',
                notification_number TEXT,
                infobip_key TEXT,
                infobip_sender TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS shortened_links (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                title TEXT,
                original_url TEXT NOT NULL,
                short_code TEXT UNIQUE NOT NULL,
                clicks INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS link_clicks (
                id SERIAL PRIMARY KEY,
                link_id INTEGER REFERENCES shortened_links(id) ON DELETE CASCADE,
                ip_address TEXT,
                user_agent TEXT,
                referrer TEXT,
                country TEXT,
                city TEXT,
                region TEXT,
                latitude DOUBLE PRECISION,
                longitude DOUBLE PRECISION,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const sql of tables) {
            await client.query(sql);
        }
        console.log('✅ Core database tables verified/created.');

        await client.query(`
            CREATE TABLE IF NOT EXISTS client_submissions (
                id SERIAL PRIMARY KEY,
                profile_photo TEXT,
                profile_name TEXT NOT NULL,
                ddd TEXT NOT NULL,
                template_type TEXT DEFAULT 'none',
                media_url TEXT,
                ad_copy TEXT,
                button_link TEXT,
                spreadsheet_url TEXT,
                ads JSONB DEFAULT '[]',
                status TEXT DEFAULT 'PENDENTE',
                accepted_by TEXT,
                assigned_to TEXT,
                sender_number TEXT,
                timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS step_leads (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                niche TEXT,
                method TEXT,
                volume TEXT,
                status TEXT DEFAULT 'NOVO',
                timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table step_leads verified/created.');
        console.log('✅ Table client_submissions verified/created.');


        // Backward-compat: add new columns if the table already existed without them
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'CLIENT'`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS ads JSONB DEFAULT '[]'`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDENTE'`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS accepted_by TEXT`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS assigned_to TEXT`);
        await client.query(`ALTER TABLE shortened_links ADD COLUMN IF NOT EXISTS target_user_id INTEGER REFERENCES users(id)`);
        await client.query(`ALTER TABLE shortened_links ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES client_submissions(id)`);
        await client.query(`ALTER TABLE shortened_links ADD COLUMN IF NOT EXISTS is_bulk BOOLEAN DEFAULT FALSE`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS sender_number TEXT`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS submitted_by TEXT`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS user_id INTEGER`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS notes TEXT`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS original_button_link TEXT`);
        await client.query(`ALTER TABLE link_clicks ADD COLUMN IF NOT EXISTS country TEXT`);
        await client.query(`ALTER TABLE link_clicks ADD COLUMN IF NOT EXISTS city TEXT`);
        await client.query(`ALTER TABLE link_clicks ADD COLUMN IF NOT EXISTS region TEXT`);
        await client.query(`ALTER TABLE link_clicks ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION`);
        await client.query(`ALTER TABLE link_clicks ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION`);

        await client.query(`
            CREATE TABLE IF NOT EXISTS infobip_templates (
                id TEXT PRIMARY KEY,
                status TEXT NOT NULL,
                user_id INTEGER REFERENCES users(id),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Backward-compat for users table
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_number TEXT`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS infobip_key TEXT`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS infobip_sender TEXT`);
        
        // Backward-compat for infobip_templates
        await client.query(`ALTER TABLE infobip_templates ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)`);

        console.log('✅ All columns and infobip_templates table verified/migrated.');
        
        // --- AFFILIATE LEADS ROBUST MIGRATIONS ---
        await client.query(`ALTER TABLE affiliate_leads ADD COLUMN IF NOT EXISTS affiliate_id INTEGER REFERENCES users(id)`);
        await client.query(`ALTER TABLE affiliate_leads ADD COLUMN IF NOT EXISTS company_name TEXT`);
        await client.query(`ALTER TABLE affiliate_leads ADD COLUMN IF NOT EXISTS offer_text TEXT`);
        await client.query(`ALTER TABLE affiliate_leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'NOVO'`);
        await client.query(`ALTER TABLE affiliate_leads ADD COLUMN IF NOT EXISTS notes TEXT`);
        await client.query(`ALTER TABLE affiliate_leads ADD COLUMN IF NOT EXISTS email TEXT`);
        await client.query(`ALTER TABLE affiliate_leads ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES users(id)`);
        console.log('✅ Table affiliate_leads columns verified/migrated.');

        // Patch: Restore roles for static team members if they were incorrectly registered as CLIENT
        await client.query("UPDATE users SET role = 'ADMIN' WHERE name = 'Admin'");
        await client.query("UPDATE users SET role = 'EMPLOYEE' WHERE name IN ('Vini', 'Italo', 'Matheus')");
        
        // Ensure client_reports schema is up-to-date
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS summary JSONB`);
        await client.query(`ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS logs JSONB DEFAULT '[]'`); // Wait, user said CARD (campaign), which is client_submissions
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS logs JSONB DEFAULT '[]'`);
        await client.query(`ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS data JSONB`);

        await client.query(`
            CREATE TABLE IF NOT EXISTS client_for_client_requests (
                id SERIAL PRIMARY KEY,
                parent_user_id INTEGER REFERENCES users(id),
                submission_id INTEGER REFERENCES client_submissions(id),
                data JSONB NOT NULL,
                approved BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Database initialized and verified.');

    } catch (err) {
        console.error('❌ FATAL DB ERROR during initDB:', err.message);
        console.error('--- DB CONNECTION DIAGNOSTIC ---');
        console.error('Target URL:', pgUrl.replace(/:[^:@]+@/, ':****@'));
        if (err.message.includes('ECONNREFUSED')) {
            console.error('HINT: The database server is unreachable. If you are running locally, ensure Postgres is installed and running.');
        } else if (err.message.includes('authentication failed')) {
            console.error('HINT: Check your database credentials (user and password) in the connection string.');
        }
    } finally {
        if (client) client.release();
    }
};
// --- GOOGLE SHEETS CONFIG ---
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "PASTE_YOUR_ID_HERE";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "PASTE_YOUR_SECRET_HERE";
const CRM_SPREADSHEET_ID = "1SnrnWoa9szFoonIebmHXRahL8YkQsDc0PC6pVjmqUE0";

const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    "http://localhost:3000" // Placeholder redirect URI
);

// Nota: Para produção, o ideal é usar uma Service Account que não requer interação do usuário.
// Como solução imediata para visualização, este endpoint tentará ler a planilha.
app.get('/api/crm/leads', async (req, res) => {
    try {
        // Como a planilha é pública, usamos o export CSV que é mais rápido e não exige chaves
        const csvUrl = `https://docs.google.com/spreadsheets/d/${CRM_SPREADSHEET_ID}/export?format=csv&gid=0`;
        
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error('Falha ao acessar a planilha pública.');
        
        const csvText = await response.text();
        
        // Parse manual simples de CSV (considerando que não há vírgulas dentro dos campos para este caso)
        // Para algo mais robusto, usaríamos uma lib de CSV, mas para colunas fixas isso funciona bem.
        const rows = csvText.split('\n').map(row => {
            // Lidar com aspas duplas que o Google Sheets coloca
            return row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim());
        });

        // Pular o cabeçalho (A1:H1)
        const dataRows = rows.slice(1);
        
        const leads = dataRows.filter(row => row.length >= 2 && row[0]).map((row, index) => ({
            id: index + 1,
            nome: row[0] || '',
            numero: row[1] || '',
            email: row[2] || '',
            tag: row[3] || '',
            status: row[4] || 'Sem Status',
            data_entrada: row[5] || '',
            responsavel: row[6] || '',
            value_client: row[7] || '0'
        }));

        res.json(leads);
    } catch (err) {
        console.error("Error fetching CRM leads (Public Mode):", err.message);
        res.status(500).json({ error: `Erro ao carregar dados: ${err.message}` });
    }
});

initDB();

// Configuração de CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- AUTH ENDPOINTS ---
app.post('/api/auth/register', async (req, res) => {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, phone, password, role, notification_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, notification_number, infobip_key, infobip_sender',
            [name, email, phone, password, role || 'CLIENT', phone || null] 
        );
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Este email já está cadastrado.' });
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/auth/profile', async (req, res) => {
    const { id, name, email, phone, password } = req.body;
    if (!id) return res.status(400).json({ error: 'ID do usuário é obrigatório.' });

    try {
        const result = await pool.query(
            `UPDATE users 
             SET name = COALESCE($1, name), 
                 email = COALESCE($2, email), 
                 phone = COALESCE($3, phone), 
                 password = COALESCE($4, password),
                 notification_number = COALESCE($5, notification_number),
                 infobip_key = COALESCE($6, infobip_key),
                 infobip_sender = COALESCE($7, infobip_sender)
             WHERE id = $8 RETURNING id, name, email, phone, role, notification_number, infobip_key, infobip_sender`,
            [
                name || null, 
                email || null, 
                phone || null, 
                password || null, 
                req.body.notification_number || null, 
                req.body.infobip_key || null,
                req.body.infobip_sender || null,
                id
            ]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Este email já está em uso.' });
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(
            'SELECT id, name, email, role, notification_number, infobip_key, infobip_sender FROM users WHERE email = $1 AND password = $2',
            [email, password]
        );
        if (result.rows.length === 0) return res.status(401).json({ error: 'Email ou senha inválidos.' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API ENDPOINTS ---

// Get all employees (Internal list + DB)
app.get('/api/employees', async (req, res) => {
    try {
        // We can use a static list or query the DB for users with role = 'EMPLOYEE'
        const result = await pool.query("SELECT name FROM users WHERE role = 'EMPLOYEE' OR role = 'ADMIN'");
        // Merge with static list if needed, or just rely on DB
        // For now, let's return combined set of names
        const staticNames = ['Italo', 'Augusto', 'Otavio', 'Lucas', 'Geraldo', 'Ricardo'];
        const dbNames = result.rows.map(r => r.name);
        const allNames = Array.from(new Set([...staticNames, ...dbNames]));
        res.json(allNames);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Get all users
app.get('/api/admin/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, role FROM users ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Update user password
app.post('/api/admin/update-password', async (req, res) => {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
        return res.status(400).json({ error: 'ID do usuário e nova senha são obrigatórios.' });
    }
    try {
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newPassword, userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Settings
app.get('/api/settings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM settings');
        const settings = {};
        result.rows.forEach(row => settings[row.key] = row.value);
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/settings', async (req, res) => {
    const { key, value } = req.body;
    try {
        await pool.query(
            'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
            [key, value]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Audit Logs (dispatch, template, engine)
app.get('/api/logs', async (req, res) => {
    try {
        const { type, userId } = req.query;
        let query = 'SELECT * FROM audit_logs';
        const params = [];

        const conditions = [];
        if (type) {
            conditions.push(`log_type = $${conditions.length + 1}`);
            params.push(type);
        }
        if (userId) {
            conditions.push(`user_id = $${conditions.length + 1}`);
            params.push(userId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY timestamp DESC LIMIT 200';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/logs', async (req, res) => {
    const { logType, author, name, template, mode, total, success, transmissionId, campaignName, stepIndex, userId } = req.body;
    try {
        await pool.query(
            'INSERT INTO audit_logs (log_type, author, name, template, mode, total, success, transmission_id, campaign_name, step_index, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
            [logType, author, name, template, mode, total || 0, success || 0, transmissionId, campaignName, stepIndex, userId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// --- Client Reports ---
app.get('/api/reports', async (req, res) => {
    try {
        const { userId, submissionId } = req.query;
        let query = `
            SELECT r.id, r.user_id, r.submission_id, r.report_name, r.filename, r.summary, r.timestamp, 
                   s.profile_name as submission_name 
            FROM client_reports r 
            LEFT JOIN client_submissions s ON r.submission_id = s.id
        `;
        const params = [];
        if (userId && userId !== 'null' && userId !== 'undefined') {
            query += ' WHERE r.user_id = $1';
            params.push(userId);
        } else if (submissionId) {
            query += ' WHERE r.submission_id = $1';
            params.push(submissionId);
        }
        query += ' ORDER BY r.timestamp DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM client_reports WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Relatório não encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports/:id/details', async (req, res) => {
    try {
        const query = `
            SELECT id, user_id, submission_id, report_name, filename, summary, timestamp,
                   (SELECT jsonb_agg(jsonb_build_object(
                       'to', COALESCE(x->>'To', x->>'to'), 
                       'status', COALESCE(x->>'Status', x->>'status'), 
                       'done_at', COALESCE(x->>'Done At', x->>'done_at')
                   )) FROM jsonb_array_elements(data) x) as data
            FROM client_reports 
            WHERE id = $1
        `;
        const result = await pool.query(query, [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Relatório não encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error in /api/reports/:id/details:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/reports', async (req, res) => {
    const { userId, submissionId, reportName, filename, data, summary } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO client_reports (user_id, submission_id, report_name, filename, data, summary) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [userId, submissionId, reportName, filename, JSON.stringify(data), JSON.stringify(summary)]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/reports/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM client_reports WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Media Library
app.get('/api/media', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM media_library ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/media/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM media_library WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload History
app.get('/api/upload-history', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM upload_history ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/upload-history', async (req, res) => {
    const { tag, count, validator, creator, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO upload_history (tag, count, validator, creator, status) VALUES ($1,$2,$3,$4,$5) RETURNING *',
            [tag, count, validator || 'N/A', creator || 'Admin', status || 'CONCLUÍDO']
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/upload-history/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM upload_history WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Contacts Lists (from UploadContacts)
app.get('/api/contacts', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, tag, count, creator, status, updated_at FROM contacts_list ORDER BY updated_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/contacts/:tag', async (req, res) => {
    try {
        const result = await pool.query('SELECT data FROM contacts_list WHERE tag = $1', [req.params.tag]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        res.json(result.rows[0].data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/contacts', async (req, res) => {
    const { tag, data, count, validator, creator } = req.body;
    try {
        await pool.query(
            `INSERT INTO contacts_list (tag, data, count, validator, creator)
             VALUES ($1,$2,$3,$4,$5)
             ON CONFLICT (tag) DO UPDATE SET data=$2, count=$3, validator=$4, creator=$5, updated_at=NOW()`,
            [tag, JSON.stringify(data), count, validator || 'N/A', creator || 'Admin']
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/contacts/:tag', async (req, res) => {
    try {
        await pool.query('DELETE FROM contacts_list WHERE tag = $1', [req.params.tag]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Campaigns (from CampaignPlanner)
app.get('/api/campaigns', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM campaigns ORDER BY updated_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/campaigns/active', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM campaigns ORDER BY updated_at DESC LIMIT 1');
        if (result.rows.length === 0) {
            return res.json(null);
        }
        const row = result.rows[0];
        res.json({ id: row.id, name: row.name, steps: row.steps, createdAt: row.created_at });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/campaigns', async (req, res) => {
    const { name, steps } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO campaigns (name, steps, updated_at) VALUES ($1,$2,NOW()) RETURNING *',
            [name, JSON.stringify(steps)]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/campaigns/:id', async (req, res) => {
    const { name, steps } = req.body;
    try {
        await pool.query(
            'UPDATE campaigns SET name=$1, steps=$2, updated_at=NOW() WHERE id=$3',
            [name, JSON.stringify(steps), req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Engine Logs (real-time execution logs)
app.get('/api/engine-logs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM engine_logs ORDER BY timestamp DESC LIMIT 500');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/engine-logs', async (req, res) => {
    const { transmissionId, logType, waba, recipient, message, payload } = req.body;
    try {
        await pool.query(
            'INSERT INTO engine_logs (transmission_id, log_type, waba, recipient, message, payload) VALUES ($1,$2,$3,$4,$5,$6)',
            [transmissionId, logType, waba, recipient, message, payload ? JSON.stringify(payload) : null]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/engine-logs', async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE engine_logs');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Engine stats (stored in Redis for speed)
app.get('/api/engine-stats', async (req, res) => {
    try {
        if (!redisClient.isOpen) {
            return res.json({ success: 0, error: 0 });
        }
        const successStr = await redisClient.get('engine_stats_success');
        const errorStr = await redisClient.get('engine_stats_error');
        res.json({
            success: parseInt(successStr || '0'),
            error: parseInt(errorStr || '0')
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/engine-stats', async (req, res) => {
    const { success, error } = req.body;
    try {
        if (!redisClient.isOpen) {
            return res.status(503).json({ error: 'Redis is not connected' });
        }
        await redisClient.set('engine_stats_success', String(success));
        await redisClient.set('engine_stats_error', String(error));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Planner Drafts (for TemplateDispatch -> CampaignPlanner flow)
app.get('/api/planner-drafts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM planner_drafts ORDER BY created_at DESC');
        res.json(result.rows.map(r => ({ ...r.data, _db_id: r.id })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/planner-drafts', async (req, res) => {
    try {
        await pool.query('INSERT INTO planner_drafts (data) VALUES ($1)', [JSON.stringify(req.body)]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Client Submissions
app.get('/api/clients', async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, email, phone FROM users WHERE role = 'CLIENT' ORDER BY name ASC");
        res.json(result.rows || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/client-submissions', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, u.name as client_name 
            FROM client_submissions c 
            LEFT JOIN users u ON c.user_id = u.id 
            ORDER BY c.timestamp DESC
        `);
        res.json(result.rows || []);
    } catch (err) {
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

app.get('/api/client/submissions', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId é obrigatório.' });
    try {
        const result = await pool.query('SELECT * FROM client_submissions WHERE user_id = $1 ORDER BY timestamp DESC', [userId]);
        res.json(result.rows || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/client-submissions/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM client_submissions WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Client-for-Client (Sub-clients) ---
app.post('/api/client-for-client/register', async (req, res) => {
    const { parentUserId, submissionId, data } = req.body;
    if (!parentUserId || !data) {
        return res.status(400).json({ error: 'parentUserId e data são obrigatórios.' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO client_for_client_requests (parent_user_id, submission_id, data) VALUES ($1, $2, $3) RETURNING id',
            [parentUserId, submissionId || null, JSON.stringify(data)]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/client-for-client', async (req, res) => {
    const { parentUserId, submissionId, approvedOnly } = req.query;
    try {
        let query = 'SELECT * FROM client_for_client_requests';
        const params = [];
        const conditions = [];

        if (parentUserId) {
            conditions.push(`parent_user_id = $${params.length + 1}`);
            params.push(parentUserId);
        }
        if (submissionId) {
            conditions.push(`submission_id = $${params.length + 1}`);
            params.push(submissionId);
        }
        if (approvedOnly === 'true') {
            conditions.push(`approved = true`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/client-for-client/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE client_for_client_requests SET approved = true WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/client-for-client/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM client_for_client_requests WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/client-submissions', async (req, res) => {
    const { profile_photo, profile_name, ddd, template_type, media_url, ad_copy, button_link, original_button_link, ads, spreadsheet_url, status, user_id, submitted_by, assigned_to, accepted_by } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO client_submissions 
            (profile_photo, profile_name, ddd, template_type, media_url, ad_copy, button_link, original_button_link, ads, spreadsheet_url, status, user_id, submitted_by, assigned_to, accepted_by) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
            [
                profile_photo, profile_name, ddd,
                template_type || 'none', media_url || '', ad_copy || '', button_link || '', original_button_link || button_link || '',
                ads ? JSON.stringify(ads) : '[]',
                spreadsheet_url, status || 'PENDENTE',
                user_id, submitted_by, assigned_to, accepted_by
            ]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/client-submissions/bulk', async (req, res) => {
    const { submissions } = req.body;
    if (!Array.isArray(submissions)) {
        return res.status(400).json({ error: 'Submissions deve ser um array.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const results = [];
        for (const s of submissions) {
            const result = await client.query(
                `INSERT INTO client_submissions 
                (profile_photo, profile_name, ddd, template_type, media_url, ad_copy, button_link, original_button_link, ads, spreadsheet_url, status, user_id, submitted_by, assigned_to, accepted_by) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
                [
                    s.profile_photo, s.profile_name, s.ddd,
                    s.template_type, s.media_url, s.ad_copy, s.button_link, s.original_button_link || s.button_link || '',
                    s.ads ? JSON.stringify(s.ads) : '[]',
                    s.spreadsheet_url, s.status || 'PENDENTE',
                    s.user_id, s.submitted_by, s.assigned_to, s.accepted_by
                ]
            );
            results.push(result.rows[0]);
        }
        await client.query('COMMIT');
        res.json(results);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error bulk adding submissions:', err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

app.put('/api/client-submissions/:id', async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    // Flexible update: handle status-only or full-body
    const fields = Object.keys(body);
    if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar.' });

    try {
        const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
        const values = [
            ...fields.map(f => {
                const val = body[f];
                // CRITICAL: Explicitly stringify arrays/objects for JSONB columns
                // node-postgres might try to send arrays as PG array syntax {...} which fails in JSONB
                if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
                    return JSON.stringify(val);
                }
                return val;
            }),
            id
        ];

        await pool.query(`UPDATE client_submissions SET ${setClause} WHERE id = $${values.length}`, values);
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating submission:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/client-submissions/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM client_submissions WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Link Shortener ---
app.post('/api/shortener/create', async (req, res) => {
    const { user_id, target_user_id, client_id, links, original_url, title, short_code: custom_code } = req.body;
    console.log(`[SHORTENER_CREATE] Request: user=${user_id}, target=${target_user_id}, client=${client_id}, url=${original_url}, custom=${custom_code}`);
    
    const linksToCreate = Array.isArray(links) ? links : [{ original_url, title, short_code: custom_code }];

    if (linksToCreate.some(l => !l.original_url)) {
        return res.status(400).json({ error: 'URL original é obrigatória para todos os links.' });
    }

    const clientDB = await pool.connect();
    try {
        await clientDB.query('BEGIN');
        const results = [];

        for (const l of linksToCreate) {
            let short_code = l.short_code || Math.random().toString(36).substring(2, 8);
            console.log(`[SHORTENER_CREATE] Processing: code=${short_code}, target=${l.original_url}`);

            if (l.short_code) {
                const check = await clientDB.query('SELECT id FROM shortened_links WHERE short_code = $1', [l.short_code]);
                if (check.rows.length > 0) {
                    throw new Error(`O código "${l.short_code}" já está em uso.`);
                }
            }

            const result = await clientDB.query(
                `INSERT INTO shortened_links (user_id, target_user_id, client_id, title, original_url, short_code) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [user_id || null, target_user_id || null, client_id || null, l.title || 'Link sem título', l.original_url, short_code]
            );

            // Robust Host/Protocol detection for Easypanel/Proxies
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const host = req.headers['x-forwarded-host'] || req.headers['host'] || req.get('host');
            const fullShortUrl = `${protocol}://${host}/l/${short_code}`;
            
            console.log(`[SHORTENER_CREATE] Saved: ID=${result.rows[0].id}, FullURL=${fullShortUrl}`);
            results.push({ ...result.rows[0], shortUrl: fullShortUrl });
        }

        await clientDB.query('COMMIT');
        res.json(Array.isArray(links) ? results : { success: true, ...results[0] });
    } catch (err) {
        await clientDB.query('ROLLBACK');
        console.error('[SHORTENER_CREATE_ERROR]', err.message);
        res.status(500).json({ error: err.message });
    } finally {
        clientDB.release();
    }
});

app.put('/api/shortener/:id', async (req, res) => {
    const { id } = req.params;
    const { target_user_id, client_id, title, original_url } = req.body;
    try {
        const result = await pool.query(
            `UPDATE shortened_links 
             SET target_user_id = COALESCE($1, target_user_id),
                 client_id = COALESCE($2, client_id),
                 title = COALESCE($3, title),
                 original_url = COALESCE($4, original_url)
             WHERE id = $5 RETURNING *`,
            [target_user_id || null, client_id || null, title || null, original_url || null, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Link não encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/shortener/links', async (req, res) => {
    const { user_id, client_id, role, startDate, endDate } = req.query;
    try {
        let selectClicks = '(SELECT COUNT(*) FROM link_clicks WHERE link_id = l.id) as clicks';
        const params = [];
        let whereClauses = [];

        if (startDate || endDate) {
            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date();
            if (endDate) end.setHours(23, 59, 59, 999);
            
            params.push(start, end);
            selectClicks = `(SELECT COUNT(*) FROM link_clicks WHERE link_id = l.id AND timestamp >= $1 AND timestamp <= $2) as clicks`;
        }

        let query = `
            SELECT l.*, 
                   ${selectClicks},
                   u.name as client_name
            FROM shortened_links l
            LEFT JOIN users u ON l.target_user_id = u.id
        `;

        if (role === 'CLIENT' && user_id) {
            whereClauses.push(`l.target_user_id = $${params.length + 1}`);
            params.push(user_id);
        } else if (client_id) {
            whereClauses.push(`l.client_id = $${params.length + 1}`);
            params.push(client_id);
        }
        // Admins and Employees see all links (no additional filter unless client_id is provided)

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        if (startDate) {
            query += (whereClauses.length > 0 ? ' AND ' : ' WHERE ') + `l.created_at >= $${params.length + 1}`;
            params.push(new Date(startDate));
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query += (whereClauses.length > 0 || startDate ? ' AND ' : ' WHERE ') + `l.created_at <= $${params.length + 1}`;
            params.push(end);
        }

        query += ' ORDER BY l.created_at DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/shortener/stats/:id', async (req, res) => {
    try {
        const link = await pool.query('SELECT * FROM shortened_links WHERE id = $1', [req.params.id]);
        if (link.rows.length === 0) return res.status(404).json({ error: 'Link não encontrado.' });

        const clicksCount = await pool.query(
            'SELECT timestamp::DATE as date, COUNT(*) as count FROM link_clicks WHERE link_id = $1 GROUP BY date ORDER BY date ASC',
            [req.params.id]
        );

        const devices = await pool.query(
            'SELECT user_agent, COUNT(*) as count FROM link_clicks WHERE link_id = $1 GROUP BY user_agent',
            [req.params.id]
        );

        const geoStats = await pool.query(
            'SELECT country, city, region, latitude as lat, longitude as lon, COUNT(*) as count FROM link_clicks WHERE link_id = $1 GROUP BY country, city, region, latitude, longitude',
            [req.params.id]
        );

        const referrers = await pool.query(
            'SELECT referrer, COUNT(*) as count FROM link_clicks WHERE link_id = $1 GROUP BY referrer ORDER BY count DESC LIMIT 10',
            [req.params.id]
        );

        res.json({
            link: link.rows[0],
            timeline: clicksCount.rows,
            devices: devices.rows,
            geo: geoStats.rows,
            referrers: referrers.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/shortener/stats/all', async (req, res) => {
    const { user_id, startDate, endDate } = req.query;
    
    // Improved parsing: handle '0', '', null, and invalid strings
    let targetUserId = null;
    if (user_id && user_id !== '0' && user_id !== 'undefined' && user_id !== 'null') {
        const parsed = parseInt(user_id);
        if (!isNaN(parsed)) targetUserId = parsed;
    }

    console.log(`[STATS_ALL] Request: user_id=${user_id}, targetUserId=${targetUserId}, range=${startDate} to ${endDate}`);

    try {
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        if (endDate) end.setHours(23, 59, 59, 999);

        const params = [start, end];
        let userFilter = "";
        let linksUserFilter = "";
        if (targetUserId) {
            params.push(targetUserId);
            userFilter = `AND sl.target_user_id = $3`;
            linksUserFilter = `AND target_user_id = $3`;
        }

        // 1. Aggregated Total Clicks & Link Count
        const totals = await pool.query(`
            SELECT 
                COALESCE((SELECT COUNT(*)::INT FROM link_clicks lc 
                 JOIN shortened_links sl ON lc.link_id = sl.id 
                 WHERE lc.timestamp >= $1 AND lc.timestamp <= $2 ${userFilter}), 0) as total_clicks,
                COALESCE((SELECT COUNT(*)::INT FROM shortened_links 
                 WHERE 1=1 ${linksUserFilter}), 0) as total_links
        `, params);

        // 2. Timeline (Aggregated)
        const timeline = await pool.query(`
            SELECT lc.timestamp::DATE as date, COUNT(*)::INT as count
            FROM link_clicks lc
            JOIN shortened_links sl ON lc.link_id = sl.id
            WHERE lc.timestamp >= $1 AND lc.timestamp <= $2 ${userFilter}
            GROUP BY date ORDER BY date ASC
        `, params);

        // 3. Top Locations (Aggregated)
        const geo = await pool.query(`
            SELECT lc.country, lc.city, COUNT(*)::INT as count
            FROM link_clicks lc
            JOIN shortened_links sl ON lc.link_id = sl.id
            WHERE lc.timestamp >= $1 AND lc.timestamp <= $2 ${userFilter}
            GROUP BY lc.country, lc.city
            ORDER BY count DESC LIMIT 10
        `, params);

        // 4. Top Devices (Aggregated)
        const devices = await pool.query(`
            SELECT 
                CASE 
                    WHEN user_agent ILIKE '%Mobi%' THEN 'Mobile'
                    WHEN user_agent ILIKE '%Android%' THEN 'Mobile'
                    WHEN user_agent ILIKE '%iPhone%' THEN 'Mobile'
                    ELSE 'Desktop/Tablets'
                END as device_type,
                COUNT(*)::INT as count
            FROM link_clicks lc
            JOIN shortened_links sl ON lc.link_id = sl.id
            WHERE lc.timestamp >= $1 AND lc.timestamp <= $2 ${userFilter}
            GROUP BY device_type ORDER BY count DESC
        `, params);

        res.json({
            summary: totals.rows[0],
            timeline: timeline.rows,
            geo: geo.rows,
            devices: devices.rows
        });
    } catch (err) {
        console.error('[STATS_ALL_ERROR]', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/shortener/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM shortened_links WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/shortener/bulk-delete', async (req, res) => {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ error: 'IDs são obrigatórios.' });
    try {
        await pool.query('DELETE FROM shortened_links WHERE id = ANY($1)', [ids]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/shortener/bulk-associate', async (req, res) => {
    const { ids, target_user_id } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ error: 'IDs são obrigatórios.' });
    try {
        await pool.query('UPDATE shortened_links SET target_user_id = $1 WHERE id = ANY($2)', [target_user_id || null, ids]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Link Shortener Routes (MOVED UP FOR PRECEDENCE) ---
// --- REDIS: Dispatch Queue Control ---
app.post('/api/dispatch/queue', async (req, res) => {
    const { messages } = req.body;
    try {
        if (!redisClient.isOpen) {
            return res.status(503).json({ error: 'Redis is not connected' });
        }
        for (const msg of messages) {
            await redisClient.lPush('dispatch_queue', JSON.stringify(msg));
        }
        const queueLen = await redisClient.lLen('dispatch_queue');
        res.json({ success: true, count: messages.length, queueLength: queueLen });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/dispatch/queue/status', async (req, res) => {
    try {
        if (!redisClient.isOpen) {
            return res.json({ queueLength: 0, isRunning: false, processed: 0, warning: 'Redis offline' });
        }
        const queueLen = await redisClient.lLen('dispatch_queue');
        const isRunning = await redisClient.get('dispatch_running');
        const processedStr = await redisClient.get('dispatch_processed');
        res.json({
            queueLength: queueLen,
            isRunning: isRunning === 'true',
            processed: parseInt(processedStr || '0')
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/dispatch/queue/stop', async (req, res) => {
    try {
        if (!redisClient.isOpen) {
            return res.status(503).json({ error: 'Redis is not connected' });
        }
        await redisClient.set('dispatch_stop', 'true');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/dispatch/queue', async (req, res) => {
    try {
        if (!redisClient.isOpen) {
            return res.status(503).json({ error: 'Redis is not connected' });
        }
        await redisClient.del('dispatch_queue');
        await redisClient.del('dispatch_stop');
        await redisClient.del('dispatch_processed');
        await redisClient.set('dispatch_running', 'false');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Pasta de uploads ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do Multer (mantido)
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

// --- Link Shortener Routes (High Precedence) ---
// Test Endpoint to verify protocol normalization without DB side-effects
app.get('/api/shortener/test-protocol', (req, res) => {
    let url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Faltando url' });
    
    let original = url;
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
        normalized = `https://${normalized}`;
    }
    res.json({ original, normalized });
});

// Redirection Global Endpoint
app.get('/l/:shortCode', async (req, res) => {
    const { shortCode } = req.params;
    console.log(`[LINK_REDIRECT] Request for: "${shortCode}"`);
    
    try {
        // Search case-insensitive just in case
        const result = await pool.query('SELECT * FROM shortened_links WHERE LOWER(short_code) = LOWER($1)', [shortCode]);
        
        if (result.rows.length === 0) {
            console.warn(`[LINK_REDIRECT] 404: Code "${shortCode}" not found.`);
            // Redirect to home/dashboard instead of showing 404
            return res.redirect('/?error=link_not_found');
        }

        const link = result.rows[0];
        console.log(`[LINK_REDIRECT] Found: ID=${link.id}, Target=${link.original_url}`);
        const userIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

        // Track Click (Fire and Forget with Geolocation)
        (async () => {
            try {
                let geoData = { country: 'Local', city: 'N/A', region: 'N/A', lat: 0, lon: 0 };

                // Only fetch if not internal/localhost
                const cleanIp = userIp.includes(',') ? userIp.split(',')[0].trim() : userIp;
                if (cleanIp !== '127.0.0.1' && cleanIp !== '::1' && !cleanIp.startsWith('::ffff:127.0.0.1')) {
                    try {
                        const geoResp = await fetch(`http://ip-api.com/json/${cleanIp}`);
                        const geo = await geoResp.json();
                        if (geo.status === 'success') {
                            geoData = {
                                country: geo.country,
                                city: geo.city,
                                region: geo.regionName,
                                lat: geo.lat,
                                lon: geo.lon
                            };
                        }
                    } catch (e) {
                        console.error("Geo API Error:", e.message);
                    }
                }

                await pool.query(
                    `INSERT INTO link_clicks (link_id, ip_address, user_agent, referrer, country, city, region, latitude, longitude) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        link.id,
                        cleanIp,
                        req.headers['user-agent'],
                        req.headers['referer'] || 'Direto',
                        geoData.country,
                        geoData.city,
                        geoData.region,
                        geoData.lat || 0,
                        geoData.lon || 0
                    ]
                );
            } catch (err) {
                console.error("Error tracking click:", err);
            }
        })();

        // Redirect with Protocol Normalization
        let targetUrl = link.original_url.trim();
        if (!/^https?:\/\//i.test(targetUrl)) {
            console.log(`[LINK_REDIRECT] Normalizing URL: ${targetUrl} -> https://${targetUrl}`);
            targetUrl = `https://${targetUrl}`;
        }

        res.redirect(targetUrl);
    } catch (err) {
        res.status(500).send('Erro interno ao processar redirecionamento.');
    }
});

// Catch-all for /l/ paths that didn't match :shortCode (e.g. nested paths or empty)
app.get('/l/*', (req, res) => {
    console.log(`[LINK_REDIRECT] Catch-all triggered for: ${req.url}`);
    res.redirect('/?error=invalid_link_format');
});

// Servir frontend estático
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/uploads', express.static(uploadDir));

// API: Upload de arquivos
app.post('/api/upload', upload.single('file'), async (req, res) => {
    console.log('--- UPLOAD REQUEST RECEIVED ---');
    console.log('File:', req.file);
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    let protocol = 'http';
    const forwardedProto = req.headers['x-forwarded-proto'];

    if (forwardedProto) {
        protocol = forwardedProto.split(',')[0].trim();
    } else {
        protocol = req.protocol;
    }

    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.json({
        success: true,
        url: fileUrl,
        path: `/uploads/${req.file.filename}`,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
    });

    let fileType = 'document';
    const mimetype = req.file.mimetype;
    if (mimetype.includes('image')) fileType = 'image';
    else if (mimetype.includes('video')) fileType = 'video';
    else if (mimetype.includes('pdf')) fileType = 'document';
    else if (mimetype.includes('spreadsheet') || mimetype.includes('excel') || mimetype.includes('csv')) fileType = 'spreadsheet';

    pool.query(
        'INSERT INTO media_library (name, type, url, short_url) VALUES ($1, $2, $3, $4)',
        [
            req.file.originalname,
            fileType,
            fileUrl,
            fileUrl
        ]
    ).catch(err => console.error("Error saving media to DB:", err));
});

// API: Queue Dispatch (Pushes to Redis)
app.post('/api/dispatch/queue', async (req, res) => {
    const { messages, apiKey } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Payload de mensagens inválido.' });
    }

    try {
        if (!redisClient.isOpen) throw new Error('Redis não está conectado.');

        // Store messages in Redis
        for (const msg of messages) {
            // Attach apiKey to each job so the worker can use it
            const job = { ...msg, _apiKey: apiKey };
            await redisClient.lPush('dispatch_queue', JSON.stringify(job));
        }

        res.json({ success: true, count: messages.length });
    } catch (err) {
        console.error('Queue Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Template Tracking (associate template name with user_id)
app.post('/api/templates/track', async (req, res) => {
    const { name, user_id } = req.body;
    if (!name || !user_id) return res.status(400).json({ error: 'Faltando nome ou user_id' });
    try {
        await pool.query(
            'INSERT INTO infobip_templates (id, status, user_id) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET user_id = $3',
            [name, 'PENDING', user_id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Log Template Creation Error
app.post('/api/logs/template-error', async (req, res) => {
    const { name, error, author } = req.body;
    try {
        await pool.query(
            'INSERT INTO engine_logs (log_type, recipient, message, payload) VALUES ($1, $2, $3, $4)',
            ['TEMPLATE_ERROR', name, `Erro na criação: ${name}`, JSON.stringify({ error, author, timestamp: new Date().toISOString() })]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Error logging template failure:', err);
        res.status(500).json({ error: 'Falha ao salvar log de erro.' });
    }
});

// --- REDIS WORKER ---
const dispatchWorker = async () => {
    try {
        if (!redisClient.isOpen) {
            console.warn('Redis is not connected yet. Retrying worker...');
            setTimeout(dispatchWorker, 5000);
            return;
        }

        const stopSignal = await redisClient.get('dispatch_stop');
        if (stopSignal === 'true') {
            await redisClient.del('dispatch_stop');
            await redisClient.set('dispatch_running', 'false');
            console.log('Dispatch worker stopped by signal.');
            setTimeout(dispatchWorker, 2000);
            return;
        }

        // Pop from Right (FIFO)
        const msgStr = await redisClient.rPop('dispatch_queue');
        if (msgStr) {
            await redisClient.set('dispatch_running', 'true');
            const job = JSON.parse(msgStr);
            const { _apiKey, ...msgPayload } = job;

            console.log(`🚀 Worker: Dispatching to ${job.to}...`);

            // EXECUTE REAL INFOBIP CALL
            try {
                const response = await fetch('https://8k6xv1.api-us.infobip.com/whatsapp/1/message/template', {
                    method: 'POST',
                    headers: {
                        'Authorization': `App ${_apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ messages: [msgPayload] })
                });

                const result = await response.json();
                const isSuccess = response.ok;

                // Log to DB
                await pool.query(
                    'INSERT INTO engine_logs (transmission_id, log_type, waba, recipient, message, payload) VALUES ($1, $2, $3, $4, $5, $6)',
                    [
                        result.messages?.[0]?.messageId || 'N/A',
                        isSuccess ? 'SUCCESS' : 'ERROR',
                        msgPayload.from,
                        msgPayload.to,
                        msgPayload.content?.templateName,
                        JSON.stringify(result)
                    ]
                );

                if (isSuccess) {
                    await redisClient.incr('dispatch_processed');
                    console.log(`✅ Worker: Success for ${job.to}`);

                    // TRIGGER WEBHOOK ON SUCCESS
                    fetch("https://db-n8n.msely6.easypanel.host/webhook-test/dispacht-control", {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ messages: [msgPayload], status: 'sent' })
                    }).catch(wErr => console.error("Webhook Error:", wErr.message));

                } else {
                    console.error(`❌ Worker: API Error for ${job.to}:`, JSON.stringify(result));
                    // Optional: Re-queue on certain errors
                }

            } catch (apiErr) {
                console.error(`❌ Worker: Network/Catch Error for ${job.to}:`, apiErr.message);
                // Re-queue on network error?
                await redisClient.lPush('dispatch_queue', msgStr);
            }

            // Rate Limit: 1.5 seconds between messages
            setTimeout(dispatchWorker, 1500);
        } else {
            await redisClient.set('dispatch_running', 'false');
            setTimeout(dispatchWorker, 3000); // Wait longer if idle
        }
    } catch (err) {
        console.error("Worker Critical Error:", err);
        setTimeout(dispatchWorker, 5000);
    }
};

dispatchWorker();

// --- WEBHOOK QUEUE WORKER ---
// Goal: Ensure webhooks "never fail" by using a Redis-backed queue with retries.
const webhookWorker = async () => {
    try {
        if (!redisClient.isOpen) {
            setTimeout(webhookWorker, 5000);
            return;
        }

        const jobStr = await redisClient.rPop('webhook_queue');
        if (jobStr) {
            const job = JSON.parse(jobStr);
            console.log(`📡 [WEBHOOK_WORKER] Processing for: ${job.targetUrl}`);

            try {
                const response = await fetch(job.targetUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(job.payload)
                });

                if (response.ok) {
                    console.log(`✅ [WEBHOOK_WORKER] Sent successfully to: ${job.targetUrl}`);
                } else {
                    const errText = await response.text();
                    console.error(`❌ [WEBHOOK_WORKER] Error response from ${job.targetUrl}:`, response.status, errText);
                    // Re-queue on 5xx or network errors (optional retry logic)
                    if (response.status >= 500 && (job.retries || 0) < 3) {
                        job.retries = (job.retries || 0) + 1;
                        await redisClient.lPush('webhook_queue', JSON.stringify(job));
                    }
                }
            } catch (err) {
                console.error(`❌ [WEBHOOK_WORKER] Network error for ${job.targetUrl}:`, err.message);
                if ((job.retries || 0) < 3) {
                    job.retries = (job.retries || 0) + 1;
                    await redisClient.lPush('webhook_queue', JSON.stringify(job));
                    console.log(`🔄 [WEBHOOK_WORKER] Re-queued job for ${job.targetUrl} (Retry ${job.retries})`);
                }
            }
            setTimeout(webhookWorker, 500); // 500ms between webhooks
        } else {
            setTimeout(webhookWorker, 3000); // Wait 3s if idle
        }
    } catch (err) {
        console.error("[WEBHOOK_WORKER] Critical Error:", err);
        setTimeout(webhookWorker, 5000);
    }
};

webhookWorker();

// --- WEBHOOK PUSH ENDPOINT ---
app.post('/api/webhook-push', async (req, res) => {
    const { targetUrl, payload } = req.body;
    if (!targetUrl || !payload) {
        return res.status(400).json({ error: "Missing targetUrl or payload" });
    }
    try {
        await redisClient.lPush('webhook_queue', JSON.stringify({ targetUrl, payload, timestamp: new Date().toISOString() }));
        console.log(`📥 [WEBHOOK_QUEUED] ${targetUrl}`);
        res.json({ success: true, message: "Webhook queued successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- AI CONTACTS FORMATTER ---
app.post('/api/contacts/ai-format', async (req, res) => {
    const { text, apiKey } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: 'Nenhum texto de planilha fornecido.' });
    }

    try {
        const openai = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY || '' });

        const prompt = `
Você é um assistente especialista em extração e limpeza de dados.
Sua tarefa é ler o texto bruto de uma planilha (CSV, TXT ou copiado do Excel) e extrair os contatos.
Devolva APENAS um JSON válido contendo um array de objetos.
Formato exato de cada objeto a ser devolvido:
{
  "nome": "João da Silva",
  "telefone": "5511999999999",
  "cpf": "123.456.789-00",
  "email": "joao@email.com"
}

Regras:
1. Ignore cabeçalhos, linhas vazias ou resumos finais.
2. O telefone deve ter exatamente 13 dígitos para números brasileiros (55 + DDD + 9 + 8 dígitos). Se faltar o 55, adicione. Se faltar o 9, tente adicionar.
3. Não adicione nenhum texto ao redor do JSON, nem crases de markdown (ex: não inclua \`\`\`json ou semelhantes). Apresente puramente o [ ... ].
4. Deixe "nome" vazio se não houver nome detectável.

Texto bruto a ser processado:
---
${text.substring(0, 15000)}
---
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 16384,
        });

        let jsonString = completion.choices[0].message.content.trim();
        if (jsonString.startsWith('```json')) {
            jsonString = jsonString.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (jsonString.startsWith('```')) {
            jsonString = jsonString.replace(/^```/, '').replace(/```$/, '').trim();
        }

        let data = [];
        try {
            data = JSON.parse(jsonString);
        } catch (parseErr) {
            console.warn('JSON Parsing incompleto. Tentando recuperar array...', parseErr.message);
            // Fallback: se o JSON foi cortado pelo limite, tenta fechar o último objeto e o array
            const lastBrace = jsonString.lastIndexOf('}');
            if (lastBrace !== -1) {
                const recoveredJson = jsonString.substring(0, lastBrace + 1) + ']';
                try {
                    data = JSON.parse(recoveredJson);
                } catch (e2) {
                    throw new Error('A planilha era muito longa e cortou a resposta da IA de forma irrecuperável: ' + parseErr.message);
                }
            } else {
                throw new Error('A resposta da IA falhou ao gerar o formato correto: ' + parseErr.message);
            }
        }

        res.json({ success: true, contacts: data });
    } catch (err) {
        console.error('AI Formatting Error:', err);
        res.status(500).json({ error: err.message || 'Erro ao processar dados com IA.' });
    }
});

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- BACKGROUND MONITORING: INFOBIP TEMPLATES ---
const startTemplateMonitoring = () => {
    console.log('🚀 [MONITOR] Inciando monitoramento de templates (45s interval)...');

    const triggerStartupWebhook = async () => {
        const payload = {
            to: '', // System-level startup, no specific user to notify
            mensagem: `🎬 *Monitor de Templates iniciado!* O servidor está online e monitorando novas aprovações a cada 45 segundos.`
        };
        const targetUrl = 'https://plug-sales-dispatch-app-n8n-2.hx8235.easypanel.host/webhook/template-aprovado';
        
        try {
            await redisClient.del('dispatch_queue');
            await redisClient.del('webhook_queue');
            console.log('🧹 [MONITOR] Redis queues cleared to prevent spam.');
        } catch (e) {
            console.error('❌ [MONITOR] Failed to clear queues on startup:', e.message);
        }
    };
    triggerStartupWebhook();

    const checkStatus = async () => {
        console.log(`🔍 [MONITOR] Iniciando verificação de templates (${new Date().toLocaleTimeString()})...`);
        let client;
        try {
            client = await pool.connect();

            // 1. Get all users who have configured their own Infobip account
            const usersRes = await client.query(`
                SELECT id, name, infobip_key, infobip_sender, notification_number 
                FROM users 
                WHERE infobip_key IS NOT NULL AND infobip_sender IS NOT NULL
            `);

            if (usersRes.rows.length === 0) {
                console.log('ℹ️ [MONITOR] Nenhum usuário com credenciais Infobip configuradas.');
                return;
            }

            for (const userRow of usersRes.rows) {
                const { id: userId, infobip_key: apiKey, infobip_sender: sender, notification_number } = userRow;
                
                console.log(`🔍 [MONITOR] Verificando templates para ${userRow.name} (Sender: ${sender})...`);

                try {
                    const response = await fetch(`https://8k6xv1.api-us.infobip.com/whatsapp/2/senders/${sender}/templates?_t=${Date.now()}`, {
                        headers: { 'Authorization': `App ${apiKey}`, 'Accept': 'application/json' }
                    });
                    
                    if (!response.ok) {
                        console.error(`❌ [MONITOR] Erro API Infobip para ${userRow.name}: ${response.status}`);
                        continue;
                    }

                    const data = await response.json();

                    if (data && data.templates) {
                        for (const t of data.templates) {
                            const templateName = t.name;
                            const newStatus = (t.status || 'PENDING').toUpperCase();

                            // 2. Check DB for previous status
                            const dbRes = await client.query("SELECT status FROM infobip_templates WHERE id = $1 AND user_id = $2", [templateName, userId]);
                            const oldStatus = dbRes.rows[0]?.status;

                            let shouldNotify = false;
                            let notificationMsg = '';

                            if (oldStatus && newStatus === 'APPROVED' && oldStatus !== 'APPROVED') {
                                shouldNotify = true;
                                notificationMsg = `✅ *Template Aprovado pela Meta!* 🚀\n\n📌 *Nome*: ${templateName}\n📂 *Categoria*: ${t.category}\n📅 *Data*: ${new Date().toLocaleString('pt-BR')}\n\nO seu template já está disponível para uso imediato no *Plug & Sales*!`;
                            } else if (oldStatus && newStatus !== oldStatus) {
                                shouldNotify = true;
                                notificationMsg = `🔄 *Alteração de Status de Template*\n\n📌 *Nome*: ${templateName}\n📉 *Status Anterior*: ${oldStatus}\n📈 *Novo Status*: ${newStatus}\n\nFique atento para futuras atualizações.`;
                            }

                            if (shouldNotify && notification_number) {
                                const targetUrl = 'https://plug-sales-dispatch-app-n8n-2.hx8235.easypanel.host/webhook/template-aprovado';
                                const payload = {
                                    to: notification_number,
                                    mensagem: notificationMsg,
                                    template: templateName,
                                    status: newStatus
                                };

                                await redisClient.lPush('webhook_queue', JSON.stringify({ targetUrl, payload, timestamp: new Date().toISOString() }));
                                console.log(`📡 [MONITOR_NOTIFY] ${templateName} -> ${userRow.name} (${notification_number})`);
                            }

                            // Update DB status per user
                            await client.query(
                                "INSERT INTO infobip_templates (id, status, user_id, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()",
                                [templateName, newStatus, userId]
                            );
                        }
                    }
                } catch (e) {
                    console.error(`❌ [MONITOR] Erro processando templates para ${userRow.name}:`, e.message);
                }
            }
        } catch (err) {
            console.error('❌ [MONITOR] Erro geral de conexão:', err.message);
        } finally {
            if (client) client.release();
        }
    };

    // Initial check (2s delay) + 45s interval
    setTimeout(checkStatus, 2000); 
    setInterval(checkStatus, 45000);
};

// Start monitoring session

startTemplateMonitoring();

// --- Step Leads ---
app.get('/api/step-leads', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM step_leads ORDER BY timestamp DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching step leads:', err);
        res.status(500).json({ error: 'Erro interno' });
    }
});

app.post('/api/step-leads', async (req, res) => {
    const { name, phone, email, niche, method, volume } = req.body;
    console.log('📬 [STEP_LEAD] New submission received:', { name, phone, email });
    try {
        const result = await pool.query(
            'INSERT INTO step_leads (name, phone, email, niche, method, volume) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, phone, email, niche, method, volume]
        );
        
        const newLead = result.rows[0];
        console.log('✅ [STEP_LEAD] Saved to database with ID:', newLead.id);

        // --- WEBHOOK N8N ---
        const webhookUrl = 'https://plug-sales-dispatch-app-n8n-2.hx8235.easypanel.host/webhook/8b096b73-408c-456e-8d27-282b8da62084';
        try {
            // Using global fetch (Node 18+)
            fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'new_lead',
                    ...newLead,
                    timestamp_br: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
                })
            }).then(r => console.log('📡 [WEBHOOK] Sent to n8n:', r.status))
              .catch(e => console.error('❌ [WEBHOOK] Error sending to n8n:', e.message));
        } catch (webhookErr) {
            console.error('❌ [WEBHOOK] Sync error:', webhookErr.message);
        }

        res.status(201).json(newLead);
    } catch (err) {
        console.error('❌ [STEP_LEAD] Error saving step lead:', err);
        res.status(500).json({ error: 'Erro interno' });
    }
});

app.delete('/api/step-leads/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM step_leads WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting step lead:', err);
        res.status(500).json({ error: 'Erro interno' });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
    console.log(`Uploads directory: ${uploadDir}`);
});
