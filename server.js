import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import pg from 'pg';
import { createClient } from 'redis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// --- DB CONFIG ---
// Fallbacks for Easypanel/Docker hosts
const DEFAULT_PG = "postgres://postgres:Marketing@plugsales2026!@plug_sales_dispatch_app_plug_sales_postgress:5432/plug_sales_dispatch_app?sslmode=disable";
const DEFAULT_REDIS = "redis://default:Marketing@plugsales2026!@plug_sales_dispatch_app_plug_sales_redis:6379";
const LOCAL_PG = "postgres://postgres:Marketing@plugsales2026!@localhost:5432/plug_sales_dispatch_app";
const LOCAL_REDIS = "redis://localhost:6379";

let pgUrl, redisUrl;

if (fs.existsSync('/.dockerenv')) {
    pgUrl = process.env.DATABASE_URL || DEFAULT_PG;
    redisUrl = process.env.REDIS_URL || DEFAULT_REDIS;
} else {
    pgUrl = LOCAL_PG;
    redisUrl = LOCAL_REDIS;
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

console.log('Postgres connection source:', pgUrl === DEFAULT_PG ? 'internal production fallback' : pgUrl === LOCAL_PG ? 'internal local fallback' : 'env DATABASE_URL');
console.log('Redis connection source:', redisUrl === DEFAULT_REDIS ? 'internal production fallback' : redisUrl === LOCAL_REDIS ? 'internal local fallback' : 'env REDIS_URL');

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
                campaign_name TEXT, step_index INTEGER, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
                sender_number TEXT,
                timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table client_submissions verified/created.');

        // Backward-compat: add new columns if the table already existed without them
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS ads JSONB DEFAULT '[]'`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDENTE'`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS accepted_by TEXT`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS sender_number TEXT`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS submitted_by TEXT`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS user_id INTEGER`);
        console.log('✅ client_submissions columns verified/migrated.');
    } catch (err) {
        console.error('❌ FATAL DB ERROR during initDB:', err.message);
    } finally {
        if (client) client.release();
    }
};
initDB();

// Configuração de CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- AUTH ENDPOINTS ---
app.post('/api/auth/register', async (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Campos obrigatórios: nome, email, senha.' });
    
    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
            [name, email, phone, password, 'CLIENT']
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
                 password = COALESCE($4, password) 
             WHERE id = $5 RETURNING id, name, email, phone, role`,
            [name, email, phone, password, id]
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
            'SELECT id, name, email, role FROM users WHERE email = $1 AND password = $2',
            [email, password]
        );
        if (result.rows.length === 0) return res.status(401).json({ error: 'Email ou senha inválidos.' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API ENDPOINTS ---

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
        const { type } = req.query;
        let query = 'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200';
        let params = [];
        if (type) {
            query = 'SELECT * FROM audit_logs WHERE log_type = $1 ORDER BY timestamp DESC LIMIT 200';
            params = [type];
        }
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/logs', async (req, res) => {
    const { logType, author, name, template, mode, total, success, transmissionId, campaignName, stepIndex } = req.body;
    try {
        await pool.query(
            'INSERT INTO audit_logs (log_type, author, name, template, mode, total, success, transmission_id, campaign_name, step_index) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
            [logType, author, name, template, mode, total || 0, success || 0, transmissionId, campaignName, stepIndex]
        );
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
app.get('/api/client-submissions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM client_submissions ORDER BY timestamp DESC');
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

app.post('/api/client-submissions', async (req, res) => {
    const { profile_photo, profile_name, ddd, template_type, media_url, ad_copy, button_link, ads, spreadsheet_url, status, user_id, submitted_by } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO client_submissions 
            (profile_photo, profile_name, ddd, template_type, media_url, ad_copy, button_link, ads, spreadsheet_url, status, user_id, submitted_by) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [
                profile_photo, profile_name, ddd, 
                template_type || 'none', media_url || '', ad_copy || '', button_link || '', 
                ads ? JSON.stringify(ads) : '[]',
                spreadsheet_url, status || 'PENDENTE',
                user_id, submitted_by
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
                (profile_photo, profile_name, ddd, template_type, media_url, ad_copy, button_link, spreadsheet_url, status) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
                [s.profile_photo, s.profile_name, s.ddd, s.template_type, s.media_url, s.ad_copy, s.button_link, s.spreadsheet_url, s.status || 'PENDENTE']
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
        const values = [...fields.map(f => body[f]), id];
        
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

// Configuração do Multer
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

    pool.query(
        'INSERT INTO media_library (name, type, url, short_url) VALUES ($1, $2, $3, $4)',
        [
            req.file.originalname,
            req.file.mimetype.includes('video') ? 'video' : 'image',
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

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
    console.log(`Uploads directory: ${uploadDir}`);
});