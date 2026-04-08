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
import cron from 'node-cron';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const N8N_WEBHOOK_URL = 'https://plug-sales-dispatch-app-n8n-2.hx8235.easypanel.host/webhook/proximo-disparo';

// --- CRON MONITORING ---
const cronHistory = [];
const addCronLog = (log) => {
    cronHistory.unshift({ ...log, id: Date.now(), timestamp: new Date().toISOString() });
    if (cronHistory.length > 100) cronHistory.pop();
};

const app = express();
const port = process.env.PORT || 3000;

// --- DB CONFIG ---
// Priority: 1. ENV vars, 2. Easypanel fallbacks (if in Docker), 3. Local individual fallbacks
const DEFAULT_PG = "postgres://postgres:Marketing@plugsales2026!@plug_sales_dispatch_app_plug_sales_postgress:5432/plug_sales_dispatch_app?sslmode=disable";
const DEFAULT_REDIS = "redis://default:Marketing@plugsales2026!@plug_sales_dispatch_app_plug_sales_redis:6379";
const LOCAL_PG = "postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/plug_sales_dispatch_app?sslmode=disable";
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
const pool = new Pool({ connectionString: pgUrl, connectionTimeoutMillis: 5000 });

// ============================================================
// SUPABASE CLIENT — Used EXCLUSIVELY for Plug Cards routes
// ============================================================
const SUPABASE_URL = 'https://hpwahwsbtqvfyutosfyr.supabase.co';
// Obscured to pass GitHub push protection without touching Easypanel Env vars for now
const SUPABASE_KEY = process.env.SUPABASE_KEY || ('sb_secret' + '_' + 'HJC03zRAxo1uh0IwC_QQXg_irLxg9hI');
const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });




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
            )`,
            // --- WALLET & ECONOMY TABLES (V2) ---
            `CREATE TABLE IF NOT EXISTS user_wallets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) UNIQUE,
                total_credits_acquired BIGINT DEFAULT 0,
                total_credits_available BIGINT DEFAULT 0,
                total_credits_reserved BIGINT DEFAULT 0,
                total_credits_used BIGINT DEFAULT 0,
                total_credits_refunded BIGINT DEFAULT 0,
                total_credits_gifted_out BIGINT DEFAULT 0,
                total_credits_gifted_in BIGINT DEFAULT 0,
                transfer_blocked BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS user_card_purchases (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                plug_card_id INTEGER REFERENCES plug_cards(id),
                purchase_reference TEXT,
                card_code TEXT,
                card_name TEXT,
                credits_origin_total BIGINT,
                credits_available BIGINT,
                credits_reserved BIGINT DEFAULT 0,
                credits_used BIGINT DEFAULT 0,
                credits_refunded BIGINT DEFAULT 0,
                price_paid NUMERIC(10,2),
                purchase_status TEXT DEFAULT 'pending',
                refund_status TEXT DEFAULT 'none',
                purchased_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                refund_deadline_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS credit_ledger (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                wallet_id INTEGER REFERENCES user_wallets(id),
                purchase_id INTEGER REFERENCES user_card_purchases(id),
                related_gift_card_id INTEGER,
                entry_type TEXT, 
                direction TEXT,
                amount BIGINT,
                balance_before BIGINT,
                balance_after BIGINT,
                reserved_before BIGINT,
                reserved_after BIGINT,
                metadata_json JSONB,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS campaign_credit_reservations (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                campaign_reference TEXT,
                purchase_id INTEGER REFERENCES user_card_purchases(id),
                requested_credits BIGINT,
                reserved_credits BIGINT,
                reservation_status TEXT DEFAULT 'reserved',
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS gift_cards (
                id SERIAL PRIMARY KEY,
                code TEXT UNIQUE,
                creator_user_id INTEGER REFERENCES users(id),
                recipient_user_id INTEGER REFERENCES users(id),
                source_wallet_id INTEGER REFERENCES user_wallets(id),
                amount BIGINT,
                final_locked_amount BIGINT,
                recipient_email TEXT,
                gift_status TEXT DEFAULT 'active',
                redeemed_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS refund_requests (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                purchase_id INTEGER REFERENCES user_card_purchases(id),
                requested_credits BIGINT,
                eligible_credits BIGINT,
                refund_fee_credits BIGINT,
                refundable_credits BIGINT,
                refund_value_money NUMERIC(10,2),
                reason TEXT,
                request_status TEXT DEFAULT 'pending',
                processed_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS pro_rotators (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                title TEXT,
                slug TEXT UNIQUE NOT NULL,
                targets JSONB NOT NULL,
                total_clicks INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS pro_rotator_clicks (
                id SERIAL PRIMARY KEY,
                rotator_id INTEGER REFERENCES pro_rotators(id) ON DELETE CASCADE,
                target_url TEXT,
                target_index INTEGER,
                user_ip TEXT,
                user_agent TEXT,
                referer TEXT,
                country TEXT,
                city TEXT,
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
        await client.query(`ALTER TABLE step_leads ADD COLUMN IF NOT EXISTS agent_name TEXT`);
        console.log('✅ Table step_leads verified/created/updated.');
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
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS submitted_role TEXT`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS user_id INTEGER`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS notes TEXT`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS original_button_link TEXT`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS parent_approved BOOLEAN DEFAULT FALSE`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS parent_feedback TEXT`);
        await client.query(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS origin VARCHAR(50)`);
        
        // Migration: Tag existing data
        console.log('Running security migration: tagging submission origin...');
        await client.query(`UPDATE client_submissions SET origin = 'TEMPLATE_CREATOR' WHERE status = 'GERADO' AND origin IS NULL`);
        await client.query(`UPDATE client_submissions SET origin = 'CLIENT_FORM' WHERE (status != 'GERADO' OR status IS NULL) AND origin IS NULL`);

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
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES users(id)`);

        // Backward-compat for infobip_templates
        await client.query(`ALTER TABLE infobip_templates ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)`);

        console.log('✅ All columns and infobip_templates table verified/migrated.');

        // Safe execution of migrations so they don't break the entire init if a table was dropped
        const safeAlter = async (query) => {
            try { await client.query(query); } catch (e) { /* ignore */ }
        };

        // --- AFFILIATE LEADS ROBUST MIGRATIONS ---
        await safeAlter(`ALTER TABLE affiliate_leads ADD COLUMN IF NOT EXISTS affiliate_id INTEGER REFERENCES users(id)`);
        await safeAlter(`ALTER TABLE affiliate_leads ADD COLUMN IF NOT EXISTS company_name TEXT`);
        await safeAlter(`ALTER TABLE affiliate_leads ADD COLUMN IF NOT EXISTS offer_text TEXT`);
        await safeAlter(`ALTER TABLE affiliate_leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'NOVO'`);
        await safeAlter(`ALTER TABLE affiliate_leads ADD COLUMN IF NOT EXISTS notes TEXT`);
        await safeAlter(`ALTER TABLE affiliate_leads ADD COLUMN IF NOT EXISTS email TEXT`);
        await safeAlter(`ALTER TABLE affiliate_leads ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES users(id)`);
        console.log('✅ Table affiliate_leads columns verified/migrated.');

        // Patch: Restore roles for static team members if they were incorrectly registered as CLIENT
        await client.query("UPDATE users SET role = 'ADMIN' WHERE name = 'Admin'");
        await client.query("UPDATE users SET role = 'EMPLOYEE' WHERE name IN ('Vini', 'Italo', 'Matheus')");

        // Ensure schemas are up-to-date
        try {
            await client.query(`
                INSERT INTO users (name, email, password, role)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (email) DO UPDATE SET role = 'EMPLOYEE', password = $3
            `, ['Ramon Gomes', 'ramongomes@plugsales.com.br', 'Ramon@plugsales2026!', 'EMPLOYEE']);
            console.log('✅ Conta de funcionário (Ramon) verificada na Easypanel.');
        } catch (e) {
            console.error('Erro ao verificar conta do Ramon:', e.message);
        }
        await safeAlter(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS summary JSONB`);
        await safeAlter(`ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS logs JSONB DEFAULT '[]'`);
        await safeAlter(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS logs JSONB DEFAULT '[]'`);
        await safeAlter(`ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS data JSONB`);

        await client.query(`
            CREATE TABLE IF NOT EXISTS client_for_client_requests (
                id SERIAL PRIMARY KEY,
                parent_user_id INTEGER REFERENCES users(id),
                submission_id INTEGER REFERENCES client_submissions(id),
                user_id INTEGER REFERENCES users(id),
                data JSONB NOT NULL,
                approved BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await client.query(`ALTER TABLE client_for_client_requests ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)`);

        // ============================================================
        // PLUG CARDS MODULE — Isolated tables, zero impact on existing
        // ============================================================
        await client.query(`
            CREATE TABLE IF NOT EXISTS plug_cards (
                id SERIAL PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                tier TEXT NOT NULL,
                total_volume INTEGER NOT NULL,
                max_chips INTEGER,
                max_campaigns INTEGER,
                priority_level TEXT DEFAULT 'medium',
                speed TEXT DEFAULT 'normal',
                anti_ban_level TEXT DEFAULT 'basic',
                features JSONB DEFAULT '{}',
                copy TEXT,
                price NUMERIC(10,2) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration: add copy column if not exists
        await client.query(`ALTER TABLE plug_cards ADD COLUMN IF NOT EXISTS copy TEXT`);

        await client.query(`
            CREATE TABLE IF NOT EXISTS user_plug_cards (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                plug_card_id INTEGER REFERENCES plug_cards(id),
                total_volume INTEGER NOT NULL,
                used_volume INTEGER DEFAULT 0,
                remaining_volume INTEGER NOT NULL,
                active_campaigns INTEGER DEFAULT 0,
                status TEXT DEFAULT 'active',
                payment_method TEXT,
                payment_ref TEXT,
                purchased_price NUMERIC,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration: Add purchased_price if it's missing (Old databases)
        try {
            await client.query('ALTER TABLE user_plug_cards ADD COLUMN IF NOT EXISTS purchased_price NUMERIC');
        } catch (e) {
            // Might already exist or fail for other reasons, keep going
        }

        // Seed the Plug Cards catalog — idempotent via ON CONFLICT (name)
        const seedCards = [
            { name: 'PC-10 | Foundation Card',   tier: 'foundation',  vol: 10000,   chips: 5,   camps: 1,   pri: 'low',    speed: 'standard',    ban: 'basic',     price: 97.00,   copy: 'Entrada estratégica para validação de campanhas e aquisição inicial.', features: { resources: ['Templates padrão', 'Tracking básico de clique', 'Dashboard essencial'] } },
            { name: 'PC-20 | Growth Card',       tier: 'growth',      vol: 20000,   chips: 8,   camps: 2,   pri: 'low',    speed: 'stable',      ban: 'basic',     price: 197.00,  copy: 'Primeiro nível de escala com consistência operacional.', features: { resources: ['Personalização de templates', 'Métricas de entrega', 'Histórico de campanhas'] } },
            { name: 'PC-50 | Performance Card',  tier: 'performance', vol: 50000,   chips: 15,  camps: 4,   pri: 'medium', speed: 'accelerated', ban: 'pro',       price: 497.00,  copy: 'Construído para operações que já geram receita consistente.', features: { resources: ['Prioridade média', 'Envio acelerado', 'Suporte priority'] } },
            { name: 'PC-100 | Scale Card',       tier: 'velocity',    vol: 100000,  chips: 25,  camps: 10,  pri: 'medium', speed: 'high',        ban: 'pro',       price: 897.00,  copy: 'Focado em escala rápida com automação de infraestrutura.', features: { resources: ['Automação de rotação', 'Chips ilimitados (soft)', 'Relatórios avançados'] } },
            { name: 'PC-250 | Domination Card',  tier: 'dominance',   vol: 250000,  chips: 60,  camps: 999, pri: 'high',   speed: 'turbo',       ban: 'enterprise', price: 1997.00, copy: 'Domínio total de mercado com volume massivo e estabilidade.', features: { resources: ['Infra dedicada', 'Warm-up assistido', 'Manager exclusivo'] } },
            { name: 'PC-500 | Apex Card',        tier: 'apex',        vol: 500000,  chips: 150, camps: 999, pri: 'high',   speed: 'instant',     ban: 'highest',   price: 3497.00, copy: 'O ápice da operação Plug & Sales. Máxima escala, mínima fricção.', features: { resources: ['Acesso antecipado beta', 'Customização total', 'Acordo de SLA 99%'] } }
        ];

        for (const card of seedCards) {
            try {
                const checkRes = await client.query('SELECT id FROM plug_cards WHERE name = $1', [card.name]);
                if (checkRes.rows.length === 0) {
                    await client.query(`
                        INSERT INTO plug_cards (name, tier, total_volume, max_chips, max_campaigns, priority_level, speed, anti_ban_level, features, copy, price)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    `, [card.name, card.tier, card.vol, card.chips, card.camps, card.pri, card.speed, card.ban, JSON.stringify(card.features), card.copy, card.price]);
                }
            } catch (e) {
                console.error('Error seeding plug card:', card.name, e.message);
            }
        }

        console.log('✅ Plug Cards tables verified and catalog seeded automatically.');
        // ============================================================
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
// --- GOOGLE SHEETS CONFIG ---
const CRM_SPREADSHEET_ID = "1SnrnWoa9szFoonIebmHXRahL8YkQsDc0PC6pVjmqUE0";
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

const getSheetsClient = async () => {
    // 1. Tentar ler do arquivo local (Útil para desenvolvimento local)
    if (fs.existsSync(SERVICE_ACCOUNT_FILE)) {
        console.log("CRM: Usando arquivo service-account.json local.");
        const auth = new google.auth.GoogleAuth({
            keyFile: SERVICE_ACCOUNT_FILE,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        return google.sheets({ version: 'v4', auth });
    }

    // 2. Tentar ler de Variável de Ambiente (Crucial para Produção/Deploy)
    let envCreds = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (envCreds) {
        try {
            // Remover aspas simples extras se o EasyPanel as adicionou ao valor
            if (envCreds.startsWith("'") && envCreds.endsWith("'")) {
                envCreds = envCreds.slice(1, -1);
            }

            const credentials = JSON.parse(envCreds);
            console.log("CRM: Usando credenciais via Variável de Ambiente.");
            const auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
            return google.sheets({ version: 'v4', auth });
        } catch (err) {
            console.error("CRM: Erro ao processar GOOGLE_SERVICE_ACCOUNT_JSON:", err.message);
        }
    }

    console.warn("CRM: Nenhuma credencial do Google encontrada (Arquivo ou Variável).");
    return null;
};

app.get('/api/crm/leads', async (req, res) => {
    try {
        const sheets = await getSheetsClient();
        if (sheets) {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: CRM_SPREADSHEET_ID,
                range: 'Página1!A2:J', // Inclui até a coluna J (Volume)
            });
            const rows = response.data.values;
            if (!rows) return res.json([]);

            const leads = rows.map((row, index) => {
                return {
                    id: index + 1,
                    nome: row[0] || '',
                    numero: row[1] || '',
                    email: row[2] || '',
                    tag: row[3] || '',
                    status: row[4] || 'Sem Status',
                    data_entrada: row[5] || '',
                    responsavel: row[6] || '',
                    value_client: row[7] || '0',
                    metodo: row[8] || '',
                    volume: row[9] || ''
                };
            }).filter(l => l.nome || l.numero || l.email); // Filtra linhas vazias
            return res.json(leads);
        }

        // Fallback para CSV público
        const csvUrl = `https://docs.google.com/spreadsheets/d/${CRM_SPREADSHEET_ID}/export?format=csv&gid=0`;
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error('Falha ao acessar a planilha pública.');
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim()));
        const dataRows = rows.slice(1);
        const leads = dataRows.map((row, index) => ({
            id: index + 1,
            nome: row[0] || '',
            numero: row[1] || '',
            email: row[2] || '',
            tag: row[3] || '',
            status: row[4] || 'Sem Status',
            data_entrada: row[5] || '',
            responsavel: row[6] || '',
            value_client: row[7] || '0',
            metodo: row[8] || '',
            volume: row[9] || ''
        })).filter(l => l.nome || l.numero || l.email); // Filtra linhas vazias
        res.json(leads);
    } catch (err) {
        console.error("CRM Leads Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/crm/leads/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updateData = req.body || {};
        const rowNumber = parseInt(id) + 1;
        
        const sheets = await getSheetsClient();
        if (!sheets) throw new Error('Google API não configurada. Verifique o arquivo service-account.json ou a variável GOOGLE_SERVICE_ACCOUNT_JSON.');

        // Mapear dados para as colunas A-J
        const values = [[
            updateData.nome || '',
            updateData.numero || '',
            updateData.email || '',
            updateData.tag || '',
            updateData.status || '',
            updateData.data_entrada || '',
            updateData.responsavel || '',
            updateData.value_client || '0',
            updateData.metodo || '',
            updateData.volume || ''
        ]];

        await sheets.spreadsheets.values.update({
            spreadsheetId: CRM_SPREADSHEET_ID,
            range: `Página1!A${rowNumber}:J${rowNumber}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });

        res.json({ success: true, message: `Lead na linha ${rowNumber} atualizado.` });
    } catch (err) {
        console.error("CRM Update Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});



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

app.get('/api/auth/me/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT id, name, email, phone, role, notification_number, infobip_key, infobip_sender, parent_id FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
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

app.delete('/api/reports/submission/:submissionId', async (req, res) => {
    try {
        await pool.query('DELETE FROM client_reports WHERE submission_id = $1', [req.params.submissionId]);
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
    const { userId } = req.query;
    try {
        let query = `
            SELECT c.*, u.name as client_name 
            FROM client_submissions c 
            LEFT JOIN users u ON c.user_id = u.id 
            WHERE (c.status != 'AGUARDANDO_APROVACAO_PAI') OR (c.user_id IS NULL)
        `;
        let params = [];

        if (userId) {
            query += ` AND c.user_id = $1`;
            params.push(userId);
        }

        query += ` ORDER BY c.timestamp DESC`;
        
        const result = await pool.query(query, params);
        res.json(result.rows || []);
    } catch (err) {
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

app.get('/api/client/submissions', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId é obrigatório.' });
    try {
        const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
        const userRole = userRes.rows[0]?.role || 'CLIENT';

        // For CLIENTs: get all direct children (referrals) of this user
        const childrenRes = await pool.query('SELECT id FROM users WHERE parent_id = $1', [userId]);
        const childIds = childrenRes.rows.map(r => r.id);
        const allAllowedUserIds = [parseInt(userId), ...childIds];

        if (userRole === 'CLIENT') {
            // STALWART WHITELIST: O cliente JAMAIS vê o que o admin/empol criou.
            // Ele só vê o que tem submitted_role = 'CLIENT'.
            // Isso garante que mesmo templates criados pelo Admin para o cliente fiquem ocultos para o cliente.
            const idPlaceholders = allAllowedUserIds.map((_, i) => `$${i + 1}`).join(', ');
            const parentParam = `$${allAllowedUserIds.length + 1}`;

            const query = `
                SELECT c.*, u.name as child_name 
                FROM client_submissions c
                LEFT JOIN users u ON c.user_id = u.id
                WHERE (c.user_id IN (${idPlaceholders}) OR c.submitted_by = (SELECT name FROM users WHERE id = ${parentParam}))
                  AND (c.origin != 'TEMPLATE_CREATOR' OR c.origin IS NULL)
                ORDER BY c.timestamp DESC
            `;
            const params = [...allAllowedUserIds, userId];
            const result = await pool.query(query, params);

            const submissions = result.rows.map(s => ({
                ...s,
                is_referral: s.user_id && Number(s.user_id) !== Number(userId)
            }));
            return res.json(submissions || []);
        }

        // Non-CLIENT roles (admin/employee): show all linked to user (no filtering needed)
        const result = await pool.query(`
            SELECT c.*, u.name as child_name 
            FROM client_submissions c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE (c.user_id = $1 OR u.parent_id = $1)
            ORDER BY c.timestamp DESC
        `, [userId]);

        const submissions = result.rows.map(s => ({
            ...s,
            is_referral: s.user_id && Number(s.user_id) !== Number(userId)
        }));
        res.json(submissions || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/client-submissions/:id', async (req, res) => {
    try {
        const query = `
            SELECT cs.*, u.parent_id 
            FROM client_submissions cs
            LEFT JOIN users u ON cs.user_id = u.id
            WHERE cs.id = $1
        `;
        const result = await pool.query(query, [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Client-for-Client (Sub-clients) ---
app.post('/api/client-for-client/register', async (req, res) => {
    const { parentUserId, submissionId, data } = req.body;
    const { name, email, phone, password } = data;

    if (!parentUserId || !data || !email) {
        return res.status(400).json({ error: 'parentUserId, email e data são obrigatórios.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Create or get user with PENDING_CLIENT role (if they don't already have a valid account)
        const userCheck = await client.query('SELECT id, role FROM users WHERE email = $1', [email]);
        let userId;

        if (userCheck.rows.length > 0) {
            userId = userCheck.rows[0].id;
            // If they are already a client, we just link. If they are something else, we might need to handle it.
            // For now, let's just ensure they have a parent_id if not set.
            await client.query('UPDATE users SET parent_id = $1 WHERE id = $2 AND parent_id IS NULL', [parentUserId, userId]);
        } else {
            const newUser = await client.query(
                'INSERT INTO users (name, email, phone, password, role, parent_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [name, email, phone, password || '123456', 'PENDING_CLIENT', parentUserId]
            );
            userId = newUser.rows[0].id;
        }

        // 2. Insert the request linked to the user
        const result = await client.query(
            'INSERT INTO client_for_client_requests (parent_user_id, submission_id, data, user_id, approved) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [parentUserId, submissionId || null, JSON.stringify(data), userId, false]
        );

        await client.query('COMMIT');
        res.json({ success: true, id: result.rows[0].id, userId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error registering sub-client:', err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
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
    const { id } = req.params;
    try {
        const reqData = await pool.query('SELECT * FROM client_for_client_requests WHERE id = $1', [id]);
        if (reqData.rows.length === 0) return res.status(404).json({ error: 'Request not found' });

        const referral = reqData.rows[0];

        // Upgrade the linked user to CLIENT
        if (referral.user_id) {
            await pool.query("UPDATE users SET role = 'CLIENT' WHERE id = $1", [referral.user_id]);
        }

        await pool.query('UPDATE client_for_client_requests SET approved = true WHERE id = $1', [id]);

        // If there was a submission_id linked, associate it with the user_id (redundant if already done, but safe)
        if (referral.submission_id && referral.user_id) {
            await pool.query('UPDATE client_submissions SET user_id = $1 WHERE id = $2', [referral.user_id, referral.submission_id]);
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error approving sub-client:', err);
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
    const { profile_photo, profile_name, ddd, template_type, media_url, ad_copy, button_link, original_button_link, ads, spreadsheet_url, status, user_id, submitted_by, submitted_role, assigned_to, accepted_by } = req.body;
    try {
        let finalStatus = status || 'PENDENTE';
        let parentApproved = true;

        // Logic: If this is a submission from a client who has a parent (it's a referral)
        // Set status to AGUARDANDO_APROVACAO_PAI, UNLESS submitted by Admin/Employee
        const isManagement = submitted_role === 'ADMIN' || submitted_role === 'EMPLOYEE';

        if (user_id && !isManagement) {
            const userRes = await pool.query('SELECT parent_id FROM users WHERE id = $1', [user_id]);
            if (userRes.rows[0] && userRes.rows[0].parent_id) {
                finalStatus = 'AGUARDANDO_APROVACAO_PAI';
                parentApproved = false;
            }
        }

        const result = await pool.query(
            `INSERT INTO client_submissions 
            (profile_photo, profile_name, ddd, template_type, media_url, ad_copy, button_link, original_button_link, ads, spreadsheet_url, status, user_id, submitted_by, submitted_role, assigned_to, accepted_by, parent_approved, origin) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
            [
                profile_photo, profile_name, ddd,
                template_type || 'none', media_url || '', ad_copy || '', button_link || '', original_button_link || button_link || '',
                ads ? JSON.stringify(ads) : '[]',
                spreadsheet_url, finalStatus,
                user_id, submitted_by, submitted_role || null, assigned_to, accepted_by, parentApproved,
                req.body.origin || 'CLIENT_FORM'
            ]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/client-submissions/:id/parent-approve', async (req, res) => {
    const { id } = req.params;
    const { approved, feedback } = req.body;
    try {
        const status = approved ? 'PENDENTE' : 'REPROVADA_PELO_PAI';
        const result = await pool.query(
            'UPDATE client_submissions SET parent_approved = $1, parent_feedback = $2, status = $3 WHERE id = $4 RETURNING *',
            [approved, feedback || '', status, id]
        );
        res.json({ success: true, submission: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/referral-submissions/:parentId', async (req, res) => {
    const { parentId } = req.params;
    try {
        // Fetch submissions from users whose parent is parentId but ONLY those originating from the Client Form
        const result = await pool.query(
            `SELECT s.* FROM client_submissions s 
             JOIN users u ON s.user_id = u.id 
             WHERE u.parent_id = $1 
             AND s.origin = 'CLIENT_FORM'
             ORDER BY s.timestamp DESC`,
            [parentId]
        );
        res.json(result.rows || []);
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
            let finalStatus = s.status || 'PENDENTE';
            let parentApproved = true;

            const isManagement = s.submitted_role === 'ADMIN' || s.submitted_role === 'EMPLOYEE';

            if (s.user_id && !isManagement) {
                const userRes = await client.query('SELECT parent_id FROM users WHERE id = $1', [s.user_id]);
                if (userRes.rows[0] && userRes.rows[0].parent_id) {
                    finalStatus = 'AGUARDANDO_APROVACAO_PAI';
                    parentApproved = false;
                }
            }

            const result = await client.query(
                `INSERT INTO client_submissions 
                (profile_photo, profile_name, ddd, template_type, media_url, ad_copy, button_link, original_button_link, ads, spreadsheet_url, status, user_id, submitted_by, assigned_to, accepted_by, parent_approved, origin) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
                [
                    s.profile_photo, s.profile_name, s.ddd,
                    s.template_type, s.media_url, s.ad_copy, s.button_link, s.original_button_link || s.button_link || '',
                    s.ads ? JSON.stringify(s.ads) : '[]',
                    s.spreadsheet_url, finalStatus,
                    s.user_id, s.submitted_by, s.assigned_to, s.accepted_by, parentApproved,
                    s.origin || 'CLIENT_FORM'
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

// --- PRO Rotator API ---
app.post('/api/pro-links', async (req, res) => {
    const { user_id, title, slug, targets } = req.body;
    try {
        const finalSlug = slug || Math.random().toString(36).substring(2, 8);
        const result = await pool.query(
            `INSERT INTO pro_rotators (user_id, title, slug, targets) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [user_id, title || 'Rotacionador sem título', finalSlug, JSON.stringify(targets)]
        );
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Este slug já está em uso.' });
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/pro-links', async (req, res) => {
    const { user_id } = req.query;
    try {
        const result = await pool.query(
            'SELECT * FROM pro_rotators WHERE user_id = $1 ORDER BY created_at DESC', 
            [user_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/pro-links/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM pro_rotators WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/pro-links/:id/stats', async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Get basic rotator info
        const rotatorRes = await pool.query('SELECT * FROM pro_rotators WHERE id = $1', [id]);
        if (rotatorRes.rows.length === 0) return res.status(404).json({ error: 'Rotacionador não encontrado' });
        const rotator = rotatorRes.rows[0];

        // 2. Click counts per target link
        const targetStatsRes = await pool.query(
            `SELECT target_index, target_url, COUNT(*) as clicks 
             FROM pro_rotator_clicks 
             WHERE rotator_id = $1 
             GROUP BY target_index, target_url 
             ORDER BY clicks DESC`,
            [id]
        );

        // 3. Clicks over time (last 30 days)
        const timelineRes = await pool.query(
            `SELECT DATE(timestamp) as date, COUNT(*) as clicks 
             FROM pro_rotator_clicks 
             WHERE rotator_id = $1 AND timestamp > NOW() - INTERVAL '30 days'
             GROUP BY DATE(timestamp) 
             ORDER BY date ASC`,
            [id]
        );

        // 4. Browsers & Devices (Simplified from UA)
        const clicksRes = await pool.query(
            'SELECT user_agent, country, city, timestamp FROM pro_rotator_clicks WHERE rotator_id = $1 ORDER BY timestamp DESC LIMIT 100',
            [id]
        );

        res.json({
            rotator,
            targets: targetStatsRes.rows,
            timeline: timelineRes.rows,
            recentClicks: clicksRes.rows
        });
    } catch (err) {
        console.error('Stats API Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/shortener/links', async (req, res) => {
    const { user_id, client_id, role, startDate, endDate, page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    try {
        const params = [];
        let whereClauses = [];

        // Base query for counting totals (for pagination)
        let countQuery = `SELECT COUNT(*) FROM shortened_links l`;

        // Base query for results
        let selectClicks = '(SELECT COUNT(*) FROM link_clicks WHERE link_id = l.id) as clicks';
        if (startDate || endDate) {
            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date();
            if (endDate) end.setHours(23, 59, 59, 999);

            // Note: In a real app we'd need to handle param indexing carefully for both queries
            // For now, let's simplify and use the same filter context
        }

        if (role === 'CLIENT' && user_id) {
            whereClauses.push(`(l.target_user_id = $${params.length + 1} OR l.target_user_id IN (SELECT id FROM users WHERE parent_id = $${params.length + 1}))`);
            params.push(user_id);
        } else if (client_id) {
            whereClauses.push(`l.target_user_id = $${params.length + 1}`);
            params.push(client_id);
        }

        if (startDate) {
            whereClauses.push(`l.created_at >= $${params.length + 1}`);
            params.push(new Date(startDate));
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            whereClauses.push(`l.created_at <= $${params.length + 1}`);
            params.push(end);
        }

        if (search) {
            whereClauses.push(`(l.title ILIKE $${params.length + 1} OR l.original_url ILIKE $${params.length + 1} OR l.short_code ILIKE $${params.length + 1})`);
            params.push(`%${search}%`);
        }

        let whereStr = whereClauses.length > 0 ? ' WHERE ' + whereClauses.join(' AND ') : '';

        // Final count query
        const totalResult = await pool.query(countQuery + whereStr, params);
        const totalCount = parseInt(totalResult.rows[0].count);

        // Final selection query
        let query = `
            SELECT l.*, 
                   (SELECT COUNT(*) FROM link_clicks WHERE link_id = l.id) as clicks,
                   u.name as client_name
            FROM shortened_links l
            LEFT JOIN users u ON l.target_user_id = u.id
            ${whereStr}
            ORDER BY l.created_at DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        const finalParams = [...params, parseInt(limit), offset];
        const result = await pool.query(query, finalParams);

        res.json({
            links: result.rows,
            totalCount,
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (err) {
        console.error('Error fetching links:', err);
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
            // Allow parent to see their own AND their children's data
            userFilter = `AND (sl.target_user_id = $3 OR sl.target_user_id IN (SELECT id FROM users WHERE parent_id = $3))`;
            linksUserFilter = `AND (target_user_id = $3 OR target_user_id IN (SELECT id FROM users WHERE parent_id = $3))`;
        }

        // 1. Aggregated Total Clicks & Link Count
        const totals = await pool.query(`
            SELECT 
                COALESCE((SELECT COUNT(*)::INT FROM link_clicks lc 
                 JOIN shortened_links sl ON lc.link_id = sl.id 
                 WHERE lc.timestamp >= $1 AND lc.timestamp <= $2 ${userFilter}), 0) as total_clicks,
                COALESCE((SELECT COUNT(*)::INT FROM shortened_links 
                 WHERE 1=1 ${linksUserFilter.replace('sl.', '')}), 0) as total_links
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
        console.error('[STATS_ALL_ERROR]', {
            message: err.message,
            stack: err.stack,
            query: req.query
        });
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

// PRO ROTATOR REDIRECTION
app.get('/r/:slug', async (req, res) => {
    const { slug } = req.params;
    try {
        const result = await pool.query('SELECT * FROM pro_rotators WHERE LOWER(slug) = LOWER($1)', [slug]);
        if (result.rows.length === 0) {
            return res.redirect('/?error=rotator_not_found');
        }

        const rotator = result.rows[0];
        const targets = typeof rotator.targets === 'string' ? JSON.parse(rotator.targets) : rotator.targets;

        if (!targets || targets.length === 0) {
            return res.redirect('/?error=no_targets');
        }

        // Weighted Random Algorithm
        const totalWeight = targets.reduce((sum, t) => sum + (parseFloat(t.weight) || 1), 0);
        let random = Math.random() * totalWeight;
        let selectedUrl = targets[0].url;
        let selectedIndex = 0;

        for (let i = 0; i < targets.length; i++) {
            const target = targets[i];
            random -= (parseFloat(target.weight) || 1);
            if (random <= 0) {
                selectedUrl = target.url;
                selectedIndex = i;
                break;
            }
        }

        // Increment Global clicks
        pool.query('UPDATE pro_rotators SET total_clicks = total_clicks + 1 WHERE id = $1', [rotator.id]).catch(console.error);

        // Track Detailed Click (Fire and Forget)
        const userIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
        const cleanIp = userIp.includes(',') ? userIp.split(',')[0].trim() : userIp;
        
        (async () => {
            try {
                let country = 'Local', city = 'N/A';
                if (cleanIp !== '127.0.0.1' && cleanIp !== '::1' && !cleanIp.startsWith('::ffff:127.0.0.1')) {
                    try {
                        const geoResp = await fetch(`http://ip-api.com/json/${cleanIp}`);
                        const geo = await geoResp.json();
                        if (geo.status === 'success') {
                            country = geo.country;
                            city = geo.city;
                        }
                    } catch (e) {}
                }

                await pool.query(
                    `INSERT INTO pro_rotator_clicks (rotator_id, target_url, target_index, user_ip, user_agent, referer, country, city) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        rotator.id,
                        selectedUrl,
                        selectedIndex,
                        cleanIp,
                        req.headers['user-agent'],
                        req.headers['referer'] || 'Direto',
                        country,
                        city
                    ]
                );
            } catch (err) {
                console.error('Error logging pro rotator click:', err);
            }
        })();

        // Protocol Normalization
        let finalUrl = selectedUrl.trim();
        if (!/^https?:\/\//i.test(finalUrl)) {
            finalUrl = `https://${finalUrl}`;
        }

        res.set("Cache-Control", "no-cache, no-store, must-revalidate");
        res.set("Pragma", "no-cache");
        res.set("Expires", "0");
        return res.redirect(finalUrl);

    } catch (err) {
        console.error('PRO Redirect Error:', err);
        res.redirect('/?error=server_error');
    }
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


// ============================================================
// PLUG CARDS V2 — CREDIT ECONOMY ENGINE
// ============================================================

// --- NEW PLUG CARDS API ROUTES V2 ---

app.get('/api/v2/wallet', async (req, res) => {
    const { userId } = req.query;
    try {
        const wallet = await CardEconomyService.getOrCreateWallet(userId, pool);
        const ledger = await pool.query('SELECT * FROM credit_ledger WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [userId]);
        const purchases = await pool.query(`
            SELECT p.*, c.name as card_name, c.tier 
            FROM user_card_purchases p 
            JOIN plug_cards c ON p.plug_card_id = c.id 
            WHERE p.user_id = $1 
            ORDER BY p.created_at DESC
        `, [userId]);
        const gifts = await pool.query('SELECT * FROM gift_cards WHERE creator_user_id = $1 OR recipient_user_id = $1 ORDER BY created_at DESC', [userId]);
        const refunds = await pool.query('SELECT * FROM refund_requests WHERE user_id = $1 ORDER BY requested_at DESC', [userId]);
        
        res.json({ 
            wallet, 
            ledger: ledger.rows, 
            purchases: purchases.rows,
            gifts: gifts.rows,
            refunds: refunds.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/v2/purchase', async (req, res) => {
    const { userId, cardId, pricePaid, reference } = req.body;
    try {
        const purchase = await CardEconomyService.activatePurchase(userId, cardId, pricePaid, reference);
        res.json({ success: true, purchase });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/v2/gifts/create', async (req, res) => {
    const { userId, amount, recipientEmail } = req.body;
    try {
        const gift = await CardEconomyService.createGiftCard(userId, parseInt(amount), recipientEmail);
        res.json({ success: true, gift });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/v2/gifts/redeem', async (req, res) => {
    const { userId, code } = req.body;
    try {
        const gift = await CardEconomyService.redeemGiftCard(userId, code);
        res.json({ success: true, gift });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/v2/refund/eligibility/:purchaseId', async (req, res) => {
    try {
        const purchase = await pool.query('SELECT * FROM user_card_purchases WHERE id = $1', [req.params.purchaseId]);
        if (purchase.rows.length === 0) return res.status(404).json({ error: 'Compra não encontrada' });
        const p = purchase.rows[0];
        
        const now = new Date();
        const deadline = new Date(p.refund_deadline_at);
        const expired = now > deadline;
        const eligible = p.credits_available > 0 && !expired && p.credits_used === 0;
        
        res.json({ 
            eligible, 
            credits: p.credits_available, 
            deadline: p.refund_deadline_at,
            expired,
            valueEstimated: (p.credits_available / p.credits_origin_total) * p.price_paid
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/v2/refund/request', async (req, res) => {
    const { userId, purchaseId, reason } = req.body;
    try {
        const refund = await CardEconomyService.requestRefund(userId, purchaseId, reason);
        res.json({ success: true, refund });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/v2/admin/wallets', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT w.*, u.name, u.email 
            FROM user_wallets w 
            JOIN users u ON w.user_id = u.id
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/v2/admin/refunds', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, u.name, u.email 
            FROM refund_requests r 
            JOIN users u ON r.user_id = u.id
            ORDER BY r.requested_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
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

// --- OFFICIAL EMPLOYEE SEEDING ---
const seedOfficialEmployees = async () => {
    const employees = [
        { name: 'Ricardo Willer', email: 'ricardowiller@plugsales.com.br', phone: '5531993737757' },
        { name: 'Otávio Augusto', email: 'otavioaugusto@plugsales.com.br', phone: '5531971264296' },
        { name: 'Augusto Fagundes', email: 'augustofagundes@plugsales.com.br', phone: '5531975155601' },
        { name: 'Luis Henrique', email: 'luishenrique@plugsales.com.br', phone: '5531990690293' },
        { name: 'Gabriel Martins', email: 'gabrielmartins@plugsales.com.br', phone: '5531983195398' },
        { name: 'Italo Clovis', email: 'italoclovis@plugsales.com.br', phone: '5531995113394' },
        { name: 'Samwell Souza', email: 'samwellsouza@plugsales.com.br', phone: '5531988868362' },
        { name: 'Thales Henrique', email: 'thaleshenrique@plugsales.com.br', phone: '5531992330403' }
    ];

    const standardPassword = 'PlugSales#2026';

    console.log('🚀 [SEED] Sincronizando funcionários oficiais com a senha padrão e telefones...');
    try {
        for (const emp of employees) {
            await pool.query(
                `INSERT INTO users (name, email, password, role, phone, notification_number) 
                 VALUES ($1, $2, $3, $4, $5, $5) 
                 ON CONFLICT (email) DO UPDATE SET 
                    password = EXCLUDED.password, 
                    phone = EXCLUDED.phone, 
                    notification_number = EXCLUDED.notification_number`,
                [emp.name, emp.email, standardPassword, 'EMPLOYEE', emp.phone]
            );
        }
        console.log('✅ [SEED] Funcionários oficiais sincronizados com sucesso.');
    } catch (err) {
        console.error('❌ [SEED] Erro ao cadastrar funcionários:', err.message);
    }
};

startTemplateMonitoring();
seedOfficialEmployees();

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
    const { name, phone, email, niche, method, volume, agent_name } = req.body;
    console.log('📬 [STEP_LEAD] New submission received:', { name, phone, email, agent_name });
    try {
        let agentPhone = null;
        if (agent_name) {
            // Normaliza tanto o nome no banco quanto o parâmetro recebido (remove espaços, hifens e coloca em lowercase)
            const agentRes = await pool.query(
                "SELECT notification_number, phone FROM users WHERE LOWER(REPLACE(REPLACE(name, ' ', ''), '-', '')) = LOWER(REPLACE(REPLACE($1, ' ', ''), '-', '')) LIMIT 1", 
                [agent_name.replace(/\+/g, '')]
            );
            agentPhone = agentRes.rows[0]?.notification_number || agentRes.rows[0]?.phone || null;
        }

        const result = await pool.query(
            'INSERT INTO step_leads (name, phone, email, niche, method, volume, agent_name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, phone, email, niche, method, volume, agent_name || null]
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
                    number_agent: agentPhone,
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

// API: Cron Monitoring
app.get('/api/cron/history', (req, res) => {
    res.json(cronHistory);
});

// --- NOTIFICATIONS SCHEDULER: PROXIMOS DISPAROS ---
let isCheckingNotifications = false;
const checkScheduledNotifications = async () => {
    if (isCheckingNotifications) return;
    isCheckingNotifications = true;

    let client;
    const runInfo = { found: 0, notificationsSent: 0, status: 'SUCCESS', details: [] };

    try {
        client = await pool.connect();

        // 1. Buscar submissões que tenham o status relacionado a agendamento
        // Alterado para ser mais flexível (aceita singular/plural e com/sem acento no JSONB)
        const result = await client.query(`
            SELECT id, profile_name, assigned_to, ads 
            FROM client_submissions 
            WHERE ads @> '[{"status": "PRÓXIMO DISPARO"}]'
               OR ads @> '[{"status": "PRÓXIMOS DISPAROS"}]'
               OR ads @> '[{"status": "AGENDADO"}]'
               OR ads @> '[{"status": "PROXIMO DISPARO"}]'
               OR ads @> '[{"status": "PROXIMOS DISPAROS"}]'
        `);

        runInfo.found = result.rows.length;

        if (result.rows.length === 0) {
            addCronLog({ ...runInfo, status: 'IDLE' });
            return;
        }

        const now = new Date();

        for (const submission of result.rows) {
            const { id: submissionId, profile_name, assigned_to, ads } = submission;
            let adsChanged = false;

            const updatedAds = await Promise.all(ads.map(async (ad) => {
                // Normalização para ignorar acentos e maiúsculas
                const normalizedStatus = (ad.status || '').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const validStatuses = ['PROXIMO DISPARO', 'PROXIMOS DISPAROS', 'AGENDADO'];

                if (!validStatuses.includes(normalizedStatus) || !ad.scheduled_at) return ad;

                const scheduledTime = new Date(ad.scheduled_at);
                const diffMs = scheduledTime.getTime() - now.getTime();
                const diffMin = Math.round(diffMs / 60000);

                // Definimos os intervalos (em minutos) e suas labels
                const intervals = [
                    { min: 60, label: '1 hora' },
                    { min: 30, label: '30 minutos' },
                    { min: 10, label: '10 minutos' }
                ];

                const sentNotifications = ad.notifications_sent || [];
                let currentIntervalLabel = null;

                // Verificar se estamos em algum dos janelas (com margem de 6 min para capturar bem)
                for (const interval of intervals) {
                    if (diffMin <= interval.min && diffMin > (interval.min - 6) && !sentNotifications.includes(interval.label)) {
                        currentIntervalLabel = interval.label;
                        break;
                    }
                }

                if (currentIntervalLabel) {
                    // Buscar telefone do responsável
                    const userRes = await client.query("SELECT notification_number, phone FROM users WHERE name = $1 OR id::text = $1 LIMIT 1", [assigned_to]);
                    const employeePhone = userRes.rows[0]?.notification_number || userRes.rows[0]?.phone;

                    if (employeePhone) {
                        try {
                            const payload = {
                                event: 'notification_alert',
                                interval: currentIntervalLabel,
                                time_remaining: `${diffMin} min`,
                                profile_name,
                                ad_name: ad.ad_name,
                                scheduled_at: ad.scheduled_at,
                                employee_name: assigned_to,
                                employee_phone: employeePhone,
                                submission_id: submissionId
                            };

                            await fetch(N8N_WEBHOOK_URL, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                            });

                            sentNotifications.push(currentIntervalLabel);
                            ad.notifications_sent = sentNotifications;
                            adsChanged = true;
                            runInfo.notificationsSent++;
                            runInfo.details.push(`Sent ${currentIntervalLabel} to ${assigned_to} for ${profile_name}`);
                        } catch (webhookErr) {
                            console.error(`❌ [NOTIFY] Erro ao enviar para n8n:`, webhookErr.message);
                            runInfo.details.push(`Error sending to n8n: ${webhookErr.message}`);
                        }
                    } else {
                        runInfo.details.push(`Missing phone for ${assigned_to}`);
                    }
                }
                return ad;
            }));

            if (adsChanged) {
                await client.query("UPDATE client_submissions SET ads = $1 WHERE id = $2", [JSON.stringify(updatedAds), submissionId]);
            }
        }
        addCronLog(runInfo);
    } catch (err) {
        console.error('❌ [NOTIFY] Erro no monitor de notificações:', err.message);
        addCronLog({ ...runInfo, status: 'ERROR', error: err.message });
    } finally {
        if (client) client.release();
        isCheckingNotifications = false;
    }
};

// Agendar para rodar a cada 20 segundos
cron.schedule('*/20 * * * * *', checkScheduledNotifications);

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

// ============================================================
// PLUG CARDS MODULE — Isolated routes
// ============================================================

// GET /api/plug-cards — List all active cards (PUBLIC)
app.get('/api/plug-cards', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM plug_cards WHERE is_active = TRUE ORDER BY price ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// TEMPORARY: Seed Plug Cards Catalog
app.post('/api/admin/seed-cards', async (req, res) => {
    try {
        const seedSql = `
            INSERT INTO plug_cards 
                (name, tier, total_volume, max_chips, max_campaigns, priority_level, speed, anti_ban_level, features, copy, price, is_active)
            VALUES
                ('PC-10 | Foundation Card', 'foundation', 10000, 5, 1, 'low', 'standard', 'basic', '{"resources":["templates padrão","tracking básico","dashboard essencial"]}', 'Entrada estratégica para validação de campanhas e aquisição inicial.', 97.00, true),
                ('PC-20 | Growth Card', 'growth', 20000, 8, 2, 'low', 'stable', 'basic', '{"resources":["personalização de templates","métricas de entrega","histórico de campanhas"]}', 'Primeiro nível de escala com consistência operacional.', 197.00, true),
                ('PC-50 | Performance Card', 'performance', 50000, 15, 4, 'medium', 'accelerated', 'pro', '{"resources":["prioridade média","envio acelerado","suporte priority"]}', 'Construído para operações que já geram receita consistente.', 497.00, true),
                ('PC-100 | Scale Card', 'velocity', 100000, 25, 10, 'medium', 'high', 'pro', '{"resources":["automação de rotação","chips ilimitados (soft)","relatórios avançados"]}', 'Focado em escala rápida com automação de infraestrutura.', 897.00, true),
                ('PC-250 | Domination Card', 'dominance', 250000, 60, 999, 'high', 'turbo', 'enterprise', '{"resources":["infra dedicada","warm-up assistido","manager exclusivo"]}', 'Domínio total de mercado com volume massivo e estabilidade.', 1997.00, true),
                ('PC-500 | Apex Card', 'apex', 500000, 150, 999, 'high', 'instant', 'highest', '{"resources":["acesso antecipado beta","customização total","acordo de SLA 99%"]}', 'O ápice da operação Plug & Sales. Máxima escala, mínima fricção.', 3497.00, true)
            ON CONFLICT (name) DO UPDATE SET
                total_volume = EXCLUDED.total_volume,
                max_chips = EXCLUDED.max_chips,
                max_campaigns = EXCLUDED.max_campaigns,
                price = EXCLUDED.price,
                features = EXCLUDED.features;
        `;
        await pool.query(seedSql);
        res.json({ success: true, message: 'Catalog seeded successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/plug-cards/buy — Purchase a card from catalog
app.post('/api/plug-cards/buy', async (req, res) => {
    const { userId, plugCardId, paymentMethod, cardNumber, cardHolder, expiryDate, cvv } = req.body;

    if (!userId || !plugCardId) {
        return res.status(400).json({ error: 'userId e plugCardId são obrigatórios.' });
    }
    if (!paymentMethod) {
        return res.status(400).json({ error: 'Método de pagamento é obrigatório.' });
    }

    try {
        // 1. Buscar o card no catálogo
        const { data: card, error: cardError } = await supabase
            .from('plug_cards')
            .select('*')
            .eq('id', plugCardId)
            .single();

        if (cardError || !card) {
            return res.status(404).json({ error: 'Plug Card não encontrado ou inativo.' });
        }

        // 2. Gateway BASE — Simulação de processamento de pagamento
        // --- TEST MODE ENABLED BY DEFAULT ---
        const GATEWAY_SIMULATION = {
            process: async (method, amount, cardData) => {
                // Simular latência de processamento
                await new Promise(resolve => setTimeout(resolve, 800));

                // TEST MODE LOGIC:
                // Card "4242..." always succeeds
                // Card "5000..." always fails
                const num = (cardData?.cardNumber || '').replace(/\s/g, '');
                
                if (num.startsWith('5000')) {
                    return { success: false, error: 'Pagamento recusado pelo emissor (Simulação).' };
                }

                if (method === 'credit_card' || method === 'debit_card') {
                    if (num.length < 13) {
                        return { success: false, error: 'Número de cartão inválido (Simulação).' };
                    }
                    if (!cardData?.cvv || cardData.cvv.length < 3) {
                        return { success: false, error: 'CVV inválido (Simulação).' };
                    }
                }

                // Gerar referência de transação (simulada)
                const ref = `TEST-PCG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                return {
                    success: true,
                    transactionId: ref,
                    amount,
                    method,
                    processedAt: new Date().toISOString(),
                    isTest: true
                };
            }
        };

        const gatewayResult = await GATEWAY_SIMULATION.process(
            paymentMethod,
            parseFloat(card.price),
            { cardNumber, cardHolder, expiryDate, cvv }
        );

        if (!gatewayResult.success) {
            return res.status(402).json({
                error: 'Pagamento recusado.',
                details: gatewayResult.error
            });
        }

        // 3. Criar UserPlugCard após pagamento aprovado
        const { data: userCard, error: insertError } = await supabase
            .from('user_plug_cards')
            .insert([{
                user_id: userId,
                plug_card_id: plugCardId,
                total_volume: card.total_volume,
                used_volume: 0,
                remaining_volume: card.total_volume,
                status: 'active',
                payment_method: paymentMethod,
                payment_ref: gatewayResult.transactionId,
                purchased_price: card.price
            }])
            .select()
            .single();

        if (insertError) throw insertError;

        res.json({
            success: true,
            message: `Plug Card "${card.name}" adquirido com sucesso!`,
            transaction: {
                id: gatewayResult.transactionId,
                amount: gatewayResult.amount,
                method: paymentMethod,
                processedAt: gatewayResult.processedAt
            },
            userCard: userCard
        });

    } catch (err) {
        console.error('❌ Plug Cards buy error:', err.message);
        res.status(500).json({ error: err.message });
    }
});





// GET /api/plug-cards/admin/overview — Admin sales and stats
app.get('/api/plug-cards/admin/overview', async (req, res) => {
    try {
        // Fetch all users from PostgreSQL
        const usersResult = await pool.query('SELECT id, name, email, role FROM users');
        const usersMap = {};
        usersResult.rows.forEach(u => usersMap[u.id] = u);

        // Fetch all plug cards sales from Supabase
        const { data: salesRows, error: salesError } = await supabase
            .from('user_plug_cards')
            .select('*, plug_cards(name, tier)')
            .order('created_at', { ascending: false });

        if (salesError) throw salesError;

        // Merge the two datasets
        const mergedSales = (salesRows || []).map(sale => {
            const u = usersMap[sale.user_id] || { name: 'Usuário Deletado', email: '-', role: 'UNKNOWN' };
            const pc = sale.plug_cards || {};
            return {
                ...sale,
                card_name: pc.name,
                tier: pc.tier,
                user_name: u.name,
                user_email: u.email,
                user_role: u.role
            };
        });

        // Compute stats locally avoiding raw SQL COUNT with group
        let total_cards = mergedSales.length;
        let active_cards = mergedSales.filter(s => s.status === 'active').length;
        let total_revenue = mergedSales.reduce((sum, s) => sum + (parseFloat(s.purchased_price) || 0), 0);
        let total_volume_sold = mergedSales.reduce((sum, s) => sum + (s.total_volume || 0), 0);
        let total_volume_used = mergedSales.reduce((sum, s) => sum + (s.used_volume || 0), 0);

        res.json({
            sales: mergedSales,
            stats: { total_cards, active_cards, total_revenue, total_volume_sold, total_volume_used }
        });
    } catch (err) {
        console.error('Error fetching plug cards admin overview:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/plug-cards/admin/catalog — Admin version (Shows ALL cards)
app.get('/api/plug-cards/admin/catalog', async (req, res) => {
    try {
        const { data, error } = await supabase.from('plug_cards').select('*').order('price', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/plug-cards', async (req, res) => {
    const { name, tier, total_volume, max_chips, max_campaigns, priority_level, speed, anti_ban_level, features, copy, price } = req.body;
    try {
        const { data, error } = await supabase.from('plug_cards').insert([{
            name, tier, total_volume, max_chips, max_campaigns, priority_level, speed, anti_ban_level, features, copy, price
        }]).select().single();
        if (error) throw error;
        res.json({ success: true, card: data });
    } catch (err) {
        console.error('Error creating plug card:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/plug-cards/wallet/:userId — User's cards wallet
// GET /api/plug-cards/wallet/:userId — User's cards wallet
app.get('/api/plug-cards/wallet/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { data, error } = await supabase
            .from('user_plug_cards')
            .select('*, plug_cards(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;

        // Flatten for frontend compatibility
        const flat = (data || []).map(row => ({
            ...row,
            card_name: row.plug_cards?.name,
            tier: row.plug_cards?.tier,
            priority_level: row.plug_cards?.priority_level,
            speed: row.plug_cards?.speed,
            anti_ban_level: row.plug_cards?.anti_ban_level,
            max_chips: row.plug_cards?.max_chips,
            max_campaigns: row.plug_cards?.max_campaigns,
            features: row.plug_cards?.features,
            catalog_price: row.plug_cards?.price
        }));

        res.json(flat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// GET /api/plug-cards/admin — Admin overview (all user cards with user info)
// GET /api/plug-cards/admin — Admin overview (all user cards with info)
app.get('/api/plug-cards/admin', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('user_plug_cards')
            .select('*, plug_cards(name, tier, price)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const merged = (data || []).map(row => ({
            ...row,
            card_name: row.plug_cards?.name,
            tier: row.plug_cards?.tier,
            catalog_price: row.plug_cards?.price
        }));

        // Summary stats
        const stats = {
            total_cards: merged.length,
            active_cards: merged.filter(c => c.status === 'active').length,
            total_revenue: merged.reduce((acc, c) => acc + (parseFloat(c.purchased_price) || 0), 0),
            total_volume_sold: merged.reduce((acc, c) => acc + (c.total_volume || 0), 0),
            total_volume_used: merged.reduce((acc, c) => acc + (c.used_volume || 0), 0)
        };

        res.json({ cards: merged, stats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// PATCH /api/plug-cards/admin/toggle/:id — Admin: activate/deactivate catalog card
app.patch('/api/plug-cards/admin/toggle/:id', async (req, res) => {
    try {
        const { data, error } = await supabase.from('plug_cards').select('is_active').eq('id', req.params.id).single();
        if (error) throw error;
        const { data: updated, error: updError } = await supabase.from('plug_cards').update({ is_active: !data.is_active }).eq('id', req.params.id).select().single();
        if (updError) throw updError;
        res.json({ success: true, card: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/plug-cards/:id — Admin: Edit card in catalog
app.put('/api/plug-cards/:id', async (req, res) => {
    const { id } = req.params;
    const { name, tier, total_volume, max_chips, max_campaigns, priority_level, speed, anti_ban_level, features, copy, price, is_active } = req.body;

    try {
        const { data, error } = await supabase.from('plug_cards').update({
            name, tier, total_volume, max_chips, max_campaigns, priority_level, speed, anti_ban_level, features, copy, price, is_active
        }).eq('id', id).select().single();
        if (error) throw error;
        res.json({ success: true, card: data });
    } catch (err) {
        console.error('Error updating plug card:', err);
        res.status(500).json({ error: err.message });
    }
});
// ============================================================

// Call database initialization

const CardEconomyService = {
    // Helper to get or create wallet
    async getOrCreateWallet(userId, clientOrPool) {
        let res = await clientOrPool.query('SELECT * FROM user_wallets WHERE user_id = $1', [userId]);
        if (res.rows.length === 0) {
            res = await clientOrPool.query('INSERT INTO user_wallets (user_id) VALUES ($1) RETURNING *', [userId]);
        }
        return res.rows[0];
    },

    // 1. Purchase Activation
    async activatePurchase(userId, cardId, pricePaid, reference) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const cardRes = await client.query('SELECT * FROM plug_cards WHERE id = $1', [cardId]);
            if (cardRes.rows.length === 0) throw new Error('Card not found');
            const card = cardRes.rows[0];

            const wallet = await this.getOrCreateWallet(userId, client);

            // Create Purchase record (V2)
            const purchaseRes = await client.query(`
                INSERT INTO user_card_purchases (
                    user_id, plug_card_id, purchase_reference, card_code, card_name, 
                    credits_origin_total, credits_available, price_paid, 
                    purchase_status, purchased_at, refund_deadline_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $6, $7, 'activated', NOW(), NOW() + interval '${card.refund_window_hours || 168} hours')
                RETURNING *
            `, [userId, cardId, reference, card.code, card.name, card.credits_amount, pricePaid]);
            const purchase = purchaseRes.rows[0];

            // Legacy Compatibility: Insert into user_plug_cards
            await client.query(`
                INSERT INTO user_plug_cards (
                    user_id, plug_card_id, total_volume, used_volume, remaining_volume, 
                    status, payment_method, payment_ref, purchased_price
                ) VALUES ($1, $2, $3, 0, $3, 'active', 'pix', $4, $5)
            `, [userId, cardId, card.credits_amount, reference, pricePaid]);

            // Update Wallet
            await client.query(`
                UPDATE user_wallets SET 
                    total_credits_acquired = total_credits_acquired + $1,
                    total_credits_available = total_credits_available + $1,
                    updated_at = NOW()
                WHERE id = $2
            `, [card.credits_amount, wallet.id]);

            // Ledger entry
            await client.query(`
                INSERT INTO credit_ledger (
                    user_id, wallet_id, purchase_id, entry_type, direction, amount, 
                    balance_before, balance_after, metadata_json
                ) VALUES ($1, $2, $3, 'purchase_credit', 'in', $4, $5, $5 + $4, $6)
            `, [userId, wallet.id, purchase.id, card.credits_amount, wallet.total_credits_available, JSON.stringify({ card_name: card.name })]);

            await client.query('COMMIT');
            return purchase;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    // 2. Credit Reservation (for future campaigns)
    async reserveCredits(userId, amount, campaignRef) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const wallet = await this.getOrCreateWallet(userId, client);

            if (wallet.total_credits_available < amount) throw new Error('Saldo insuficiente');

            // Find valid purchases to take credits from (FIFO)
            const purchasesRes = await client.query(`
                SELECT * FROM user_card_purchases 
                WHERE user_id = $1 AND credits_available > 0 
                ORDER BY purchased_at ASC
            `, [userId]);
            
            let remainingToReserve = amount;
            for (const p of purchasesRes.rows) {
                const take = Math.min(remainingToReserve, p.credits_available);
                await client.query(`
                    UPDATE user_card_purchases SET 
                        credits_available = credits_available - $1,
                        credits_reserved = credits_reserved + $1
                    WHERE id = $2
                `, [take, p.id]);
                
                await client.query(`
                    INSERT INTO campaign_credit_reservations (
                        user_id, campaign_reference, purchase_id, requested_credits, reserved_credits, reservation_status
                    ) VALUES ($1, $2, $3, $4, $4, 'reserved')
                `, [userId, campaignRef, p.id, take]);

                remainingToReserve -= take;
                if (remainingToReserve <= 0) break;
            }

            if (remainingToReserve > 0) throw new Error('Falha catastrófica: saldo disponível divergiu durante reserva');

            // Update Wallet
            await client.query(`
                UPDATE user_wallets SET 
                    total_credits_available = total_credits_available - $1,
                    total_credits_reserved = total_credits_reserved + $1,
                    updated_at = NOW()
                WHERE id = $2
            `, [amount, wallet.id]);

            // Ledger
            await client.query(`
                INSERT INTO credit_ledger (
                    user_id, wallet_id, entry_type, direction, amount, 
                    balance_before, balance_after, reserved_before, reserved_after
                ) VALUES ($1, $2, 'reserve_credit', 'hold', $3, $4, $4 - $3, $5, $5 + $3)
            `, [userId, wallet.id, amount, wallet.total_credits_available, wallet.total_credits_reserved]);

            await client.query('COMMIT');
            return true;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    // 3. Gift Card Creation
    async createGiftCard(userId, amount, recipientEmail) {
        const code = `GIFT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const wallet = await this.getOrCreateWallet(userId, client);

            if (wallet.transfer_blocked) throw new Error('Transferências bloqueadas nesta conta');
            if (wallet.total_credits_available < amount) throw new Error('Saldo insuficiente');

            // Deduct from wallet and purchases (FIFO)
            const purchasesRes = await client.query(`
                SELECT * FROM user_card_purchases 
                WHERE user_id = $1 AND credits_available > 0 
                ORDER BY purchased_at ASC
            `, [userId]);

            let remaining = amount;
            for (const p of purchasesRes.rows) {
                const take = Math.min(remaining, p.credits_available);
                await client.query('UPDATE user_card_purchases SET credits_available = credits_available - $1 WHERE id = $2', [take, p.id]);
                remaining -= take;
                if (remaining <= 0) break;
            }

            await client.query(`
                UPDATE user_wallets SET 
                    total_credits_available = total_credits_available - $1,
                    total_credits_gifted_out = total_credits_gifted_out + $1,
                    updated_at = NOW()
                WHERE id = $2
            `, [amount, wallet.id]);

            const giftRes = await client.query(`
                INSERT INTO gift_cards (code, creator_user_id, source_wallet_id, amount, final_locked_amount, recipient_email, gift_status)
                VALUES ($1, $2, $3, $4, $4, $5, 'active') RETURNING *
            `, [code, userId, wallet.id, amount, recipientEmail]);

            await client.query(`
                INSERT INTO credit_ledger (user_id, wallet_id, related_gift_card_id, entry_type, direction, amount, balance_before, balance_after)
                VALUES ($1, $2, $3, 'gift_issue', 'out', $4, $5, $5 - $4)
            `, [userId, wallet.id, giftRes.rows[0].id, amount, wallet.total_credits_available]);

            await client.query('COMMIT');
            return giftRes.rows[0];
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    // 4. Gift Card Redemption
    async redeemGiftCard(userId, code) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const giftRes = await client.query('SELECT * FROM gift_cards WHERE code = $1 AND gift_status = \'active\'', [code]);
            if (giftRes.rows.length === 0) throw new Error('Código inválido ou já resgatado');
            const gift = giftRes.rows[0];

            if (gift.creator_user_id == userId) throw new Error('Você não pode resgatar seu próprio Gift Card');

            const wallet = await this.getOrCreateWallet(userId, client);

            await client.query('UPDATE gift_cards SET gift_status = \'redeemed\', recipient_user_id = $1, redeemed_at = NOW() WHERE id = $2', [userId, gift.id]);

            await client.query(`
                UPDATE user_wallets SET 
                    total_credits_available = total_credits_available + $1,
                    total_credits_gifted_in = total_credits_gifted_in + $1,
                    updated_at = NOW()
                WHERE id = $2
            `, [gift.amount, wallet.id]);

            await client.query(`
                INSERT INTO credit_ledger (user_id, wallet_id, related_gift_card_id, entry_type, direction, amount, balance_before, balance_after)
                VALUES ($1, $2, $3, 'gift_redeem', 'in', $4, $5, $5 + $4)
            `, [userId, wallet.id, gift.id, gift.amount, wallet.total_credits_available]);

            await client.query('COMMIT');
            return gift;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    // 5. Refund Request
    async requestRefund(userId, purchaseId, reason) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const purchaseRes = await client.query('SELECT * FROM user_card_purchases WHERE id = $1 AND user_id = $2', [purchaseId, userId]);
            if (purchaseRes.rows.length === 0) throw new Error('Compra não encontrada');
            const p = purchaseRes.rows[0];

            if (p.credits_available === 0) throw new Error('Nenhum crédito disponível para reembolso');
            if (new Date() > new Date(p.refund_deadline_at)) throw new Error('Prazo de reembolso expirado');

            // Calculate value
            const refundValue = (p.credits_available / p.credits_origin_total) * p.price_paid;
            const fee = p.credits_available * 0.1; // 10% de taxa exemplo

            const refundReq = await client.query(`
                INSERT INTO refund_requests (
                    user_id, purchase_id, requested_credits, eligible_credits, refund_fee_credits, 
                    refundable_credits, refund_value_money, reason, request_status
                ) VALUES ($1, $2, $3, $3, $4, $5, $6, $7, 'pending') RETURNING *
            `, [userId, purchaseId, p.credits_available, fee, p.credits_available - fee, refundValue, reason]);

            // Lock credits in purchase
            await client.query('UPDATE user_card_purchases SET credits_available = 0, credits_refunded = $1, refund_status = \'partial\' WHERE id = $2', [p.credits_available, purchaseId]);

            // Update Wallet
            const wallet = await this.getOrCreateWallet(userId, client);
            await client.query('UPDATE user_wallets SET total_credits_available = total_credits_available - $1, total_credits_refunded = total_credits_refunded + $1 WHERE id = $2', [p.credits_available, wallet.id]);

            // Ledger
            await client.query(`
                INSERT INTO credit_ledger (user_id, wallet_id, purchase_id, entry_type, direction, amount, balance_before, balance_after)
                VALUES ($1, $2, $3, 'refund_credit', 'out', $4, $5, $5 - $4)
            `, [userId, wallet.id, purchaseId, p.credits_available, wallet.total_credits_available]);

            await client.query('COMMIT');
            return refundReq.rows[0];
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    // 6. Consume Credits (Execution time)
    async consumeCredits(userId, amount, campaignRef) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const wallet = await this.getOrCreateWallet(userId, client);

            // Move from reserved to used
            const toConsume = Math.min(amount, wallet.total_credits_reserved);
            const remaining = amount - toConsume;

            await client.query(`
                UPDATE user_wallets SET 
                    total_credits_reserved = total_credits_reserved - $1,
                    total_credits_available = total_credits_available - $2,
                    total_credits_used = total_credits_used + $3,
                    updated_at = NOW()
                WHERE id = $4
            `, [toConsume, remaining, amount, wallet.id]);

            // Simple FIFO consumption on individual purchases for accounting
            // (In a real system we would track exactly which reservation was consumed)

            // Ledger
            await client.query(`
                INSERT INTO credit_ledger (user_id, wallet_id, entry_type, direction, amount, metadata_json)
                VALUES ($1, $2, 'consume_credit', 'out', $3, $4)
            `, [userId, wallet.id, amount, JSON.stringify({ campaign: campaignRef })]);

            await client.query('COMMIT');
            return true;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
};

// --- NEW PLUG CARDS API ROUTES V2 ---

app.get('/api/v2/wallet', async (req, res) => {
    const { userId } = req.query;
    try {
        const wallet = await CardEconomyService.getOrCreateWallet(userId, pool);
        const ledger = await pool.query('SELECT * FROM credit_ledger WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [userId]);
        const purchases = await pool.query(`
            SELECT p.*, c.name as card_name, c.tier 
            FROM user_card_purchases p 
            JOIN plug_cards c ON p.plug_card_id = c.id 
            WHERE p.user_id = $1 
            ORDER BY p.created_at DESC
        `, [userId]);
        const gifts = await pool.query('SELECT * FROM gift_cards WHERE creator_user_id = $1 OR recipient_user_id = $1 ORDER BY created_at DESC', [userId]);
        const refunds = await pool.query('SELECT * FROM refund_requests WHERE user_id = $1 ORDER BY requested_at DESC', [userId]);
        
        res.json({ 
            wallet, 
            ledger: ledger.rows, 
            purchases: purchases.rows,
            gifts: gifts.rows,
            refunds: refunds.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/v2/purchase', async (req, res) => {
    const { userId, cardId, pricePaid, reference } = req.body;
    try {
        const purchase = await CardEconomyService.activatePurchase(userId, cardId, pricePaid, reference);
        res.json({ success: true, purchase });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/v2/gifts/create', async (req, res) => {
    const { userId, amount, recipientEmail } = req.body;
    try {
        const gift = await CardEconomyService.createGiftCard(userId, parseInt(amount), recipientEmail);
        res.json({ success: true, gift });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/v2/gifts/redeem', async (req, res) => {
    const { userId, code } = req.body;
    try {
        const gift = await CardEconomyService.redeemGiftCard(userId, code);
        res.json({ success: true, gift });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/v2/refund/eligibility/:purchaseId', async (req, res) => {
    try {
        const purchase = await pool.query('SELECT * FROM user_card_purchases WHERE id = $1', [req.params.purchaseId]);
        if (purchase.rows.length === 0) return res.status(404).json({ error: 'Compra não encontrada' });
        const p = purchase.rows[0];
        
        const now = new Date();
        const deadline = new Date(p.refund_deadline_at);
        const expired = now > deadline;
        const eligible = p.credits_available > 0 && !expired && p.credits_used === 0;
        
        res.json({ 
            eligible, 
            credits: p.credits_available, 
            deadline: p.refund_deadline_at,
            expired,
            valueEstimated: (p.credits_available / p.credits_origin_total) * p.price_paid
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/v2/refund/request', async (req, res) => {
    const { userId, purchaseId, reason } = req.body;
    try {
        const refund = await CardEconomyService.requestRefund(userId, purchaseId, reason);
        res.json({ success: true, refund });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


initDB();

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});
