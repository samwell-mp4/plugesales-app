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
const pgUrl = process.env.DATABASE_URL || "postgres://postgres:Marketing%40plugsales2026!@plug_sales_dispatch_app_plug_sales_postgress:5432/plug_sales_dispatch_app?sslmode=disable";
const redisUrl = process.env.REDIS_URL || "redis://default:Marketing%40plugsales2026!@plug_sales_dispatch_app_plug_sales_redis:6379";

const { Pool } = pg;
const pool = new Pool({ connectionString: pgUrl });

const redisClient = createClient({ url: redisUrl });
redisClient.on('error', err => console.error('Redis Error:', err));
await redisClient.connect().catch(e => console.error('Redis Connect Error:', e));

// Initialize Database Tables
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            );
            CREATE TABLE IF NOT EXISTS media_library (
                id SERIAL PRIMARY KEY,
                name TEXT,
                type TEXT,
                url TEXT,
                short_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS audit_logs (
                id SERIAL PRIMARY KEY,
                log_type TEXT,
                author TEXT,
                name TEXT,
                template TEXT,
                mode TEXT,
                total INTEGER DEFAULT 0,
                success INTEGER DEFAULT 0,
                transmission_id TEXT,
                campaign_name TEXT,
                step_index INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS contacts_list (
                id SERIAL PRIMARY KEY,
                tag TEXT UNIQUE,
                data JSONB,
                count INTEGER DEFAULT 0,
                validator TEXT,
                creator TEXT DEFAULT 'Admin',
                status TEXT DEFAULT 'CONCLUÍDO',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS upload_history (
                id SERIAL PRIMARY KEY,
                tag TEXT,
                count INTEGER DEFAULT 0,
                validator TEXT,
                creator TEXT DEFAULT 'Admin',
                status TEXT DEFAULT 'CONCLUÍDO',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS campaigns (
                id SERIAL PRIMARY KEY,
                name TEXT,
                steps JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS engine_logs (
                id SERIAL PRIMARY KEY,
                transmission_id TEXT,
                log_type TEXT,
                waba TEXT,
                recipient TEXT,
                message TEXT,
                payload JSONB,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS planner_drafts (
                id SERIAL PRIMARY KEY,
                data JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Database initialized successfully.");
    } catch (err) {
        console.error("Database initialization failed:", err);
    }
};
initDB();

// Configuração de CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- API ENDPOINTS ---

// Settings
app.get('/api/settings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM settings');
        const settings = {};
        result.rows.forEach(row => settings[row.key] = row.value);
        res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/settings', async (req, res) => {
    const { key, value } = req.body;
    try {
        await pool.query(
            'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
            [key, value]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
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
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/logs', async (req, res) => {
    const { logType, author, name, template, mode, total, success, transmissionId, campaignName, stepIndex } = req.body;
    try {
        await pool.query(
            'INSERT INTO audit_logs (log_type, author, name, template, mode, total, success, transmission_id, campaign_name, step_index) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
            [logType, author, name, template, mode, total || 0, success || 0, transmissionId, campaignName, stepIndex]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Media Library
app.get('/api/media', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM media_library ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/media/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM media_library WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Upload History
app.get('/api/upload-history', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM upload_history ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/upload-history', async (req, res) => {
    const { tag, count, validator, creator, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO upload_history (tag, count, validator, creator, status) VALUES ($1,$2,$3,$4,$5) RETURNING *',
            [tag, count, validator || 'N/A', creator || 'Admin', status || 'CONCLUÍDO']
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/upload-history/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM upload_history WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Contacts Lists (from UploadContacts)
app.get('/api/contacts', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, tag, count, creator, status, updated_at FROM contacts_list ORDER BY updated_at DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/contacts/:tag', async (req, res) => {
    try {
        const result = await pool.query('SELECT data FROM contacts_list WHERE tag = $1', [req.params.tag]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Tag not found' });
        res.json(result.rows[0].data);
    } catch (err) { res.status(500).json({ error: err.message }); }
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
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/contacts/:tag', async (req, res) => {
    try {
        await pool.query('DELETE FROM contacts_list WHERE tag = $1', [req.params.tag]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Campaigns (from CampaignPlanner)
app.get('/api/campaigns', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM campaigns ORDER BY updated_at DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/campaigns/active', async (req, res) => {
    try {
        // Return the most recently updated campaign as "active"
        const result = await pool.query('SELECT * FROM campaigns ORDER BY updated_at DESC LIMIT 1');
        if (result.rows.length === 0) return res.json(null);
        const row = result.rows[0];
        res.json({ id: row.id, name: row.name, steps: row.steps, createdAt: row.created_at });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/campaigns', async (req, res) => {
    const { name, steps } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO campaigns (name, steps, updated_at) VALUES ($1,$2,NOW()) RETURNING *',
            [name, JSON.stringify(steps)]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/campaigns/:id', async (req, res) => {
    const { name, steps } = req.body;
    try {
        await pool.query(
            'UPDATE campaigns SET name=$1, steps=$2, updated_at=NOW() WHERE id=$3',
            [name, JSON.stringify(steps), req.params.id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Engine Logs (real-time execution logs)
app.get('/api/engine-logs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM engine_logs ORDER BY timestamp DESC LIMIT 500');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/engine-logs', async (req, res) => {
    const { transmissionId, logType, waba, recipient, message, payload } = req.body;
    try {
        await pool.query(
            'INSERT INTO engine_logs (transmission_id, log_type, waba, recipient, message, payload) VALUES ($1,$2,$3,$4,$5,$6)',
            [transmissionId, logType, waba, recipient, message, payload ? JSON.stringify(payload) : null]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/engine-logs', async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE engine_logs');
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Engine stats (stored in Redis for speed)
app.get('/api/engine-stats', async (req, res) => {
    try {
        const successStr = await redisClient.get('engine_stats_success');
        const errorStr = await redisClient.get('engine_stats_error');
        res.json({ success: parseInt(successStr || '0'), error: parseInt(errorStr || '0') });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/engine-stats', async (req, res) => {
    const { success, error } = req.body;
    try {
        await redisClient.set('engine_stats_success', String(success));
        await redisClient.set('engine_stats_error', String(error));
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Planner Drafts (for TemplateDispatch -> CampaignPlanner flow)
app.get('/api/planner-drafts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM planner_drafts ORDER BY created_at DESC');
        res.json(result.rows.map(r => ({ ...r.data, _db_id: r.id })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/planner-drafts', async (req, res) => {
    try {
        await pool.query('INSERT INTO planner_drafts (data) VALUES ($1)', [JSON.stringify(req.body)]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/planner-drafts', async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE planner_drafts');
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- REDIS: Dispatch Queue Control ---
app.post('/api/dispatch/queue', async (req, res) => {
    const { messages } = req.body;
    try {
        for (const msg of messages) {
            await redisClient.lPush('dispatch_queue', JSON.stringify(msg));
        }
        const queueLen = await redisClient.lLen('dispatch_queue');
        res.json({ success: true, count: messages.length, queueLength: queueLen });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/dispatch/queue/status', async (req, res) => {
    try {
        const queueLen = await redisClient.lLen('dispatch_queue');
        const isRunning = await redisClient.get('dispatch_running');
        const processedStr = await redisClient.get('dispatch_processed');
        res.json({
            queueLength: queueLen,
            isRunning: isRunning === 'true',
            processed: parseInt(processedStr || '0')
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/dispatch/queue/stop', async (req, res) => {
    try {
        await redisClient.set('dispatch_stop', 'true');
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/dispatch/queue', async (req, res) => {
    try {
        await redisClient.del('dispatch_queue');
        await redisClient.del('dispatch_stop');
        await redisClient.del('dispatch_processed');
        await redisClient.set('dispatch_running', 'false');
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
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
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

// Servir frontend estático
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/uploads', express.static(uploadDir));

// API: Upload de arquivos
app.post('/api/upload', upload.single('file'), async (req, res) => {
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

    // Save to DB Library
    pool.query(
        'INSERT INTO media_library (name, type, url, short_url) VALUES ($1, $2, $3, $4)',
        [req.file.originalname, req.file.mimetype.includes('video') ? 'video' : 'image', fileUrl, fileUrl]
    ).catch(err => console.error("Error saving media to DB:", err));
});

// --- REDIS WORKER ---
const dispatchWorker = async () => {
    try {
        const stopSignal = await redisClient.get('dispatch_stop');
        if (stopSignal === 'true') {
            await redisClient.del('dispatch_stop');
            await redisClient.set('dispatch_running', 'false');
            console.log('Dispatch worker stopped by signal.');
            setTimeout(dispatchWorker, 2000);
            return;
        }

        const msgStr = await redisClient.rPop('dispatch_queue');
        if (msgStr) {
            await redisClient.set('dispatch_running', 'true');
            const msg = JSON.parse(msgStr);
            console.log(`Processing dispatch for ${msg.to}...`);

            // Increment processed counter
            await redisClient.incr('dispatch_processed');

            // Space the next pop
            setTimeout(dispatchWorker, 12000);
        } else {
            await redisClient.set('dispatch_running', 'false');
            setTimeout(dispatchWorker, 2000);
        }
    } catch (err) {
        console.error("Worker Error:", err);
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
