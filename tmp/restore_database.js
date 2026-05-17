import pkg from 'pg';
const { Pool } = pkg;

// Use the exact database URL from backend/database/db.js
const pgUrl = "postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/plug_sales_dispatch_app?sslmode=disable";
console.log("Connecting to:", pgUrl.replace(/:[^:@]+@/, ':****@'));

const pool = new Pool({ 
    connectionString: pgUrl, 
    connectionTimeoutMillis: 10000 
});

async function runRecovery() {
    console.log("🚀 Starting database tables restoration for Plug & Sales...");
    let client;
    
    try {
        client = await pool.connect();
        console.log("✅ Connected to Postgres database!");

        // All the CREATE TABLE queries from server.js's initDB
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
                google_access_token TEXT,
                google_refresh_token TEXT,
                google_token_expiry BIGINT,
                google_calendar_id TEXT,
                google_email TEXT,
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
            `CREATE TABLE IF NOT EXISTS materials (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT,
                drive_id TEXT UNIQUE,
                folder TEXT,
                context TEXT,
                thumbnail_link TEXT,
                is_favorite BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS smart_bios (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id INTEGER,
                title TEXT,
                description TEXT,
                avatar_url TEXT,
                video_url TEXT,
                buttons JSONB DEFAULT '[]',
                images JSONB DEFAULT '[]',
                slug TEXT UNIQUE,
                clicks INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS digital_cards (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id INTEGER,
                name TEXT,
                photo_url TEXT,
                company TEXT,
                whatsapp TEXT,
                social_links JSONB DEFAULT '{}',
                opens INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS tracking_events (
                id SERIAL PRIMARY KEY,
                target_id UUID,
                event_type TEXT,
                metadata JSONB,
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
            `CREATE TABLE IF NOT EXISTS plug_cards (
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
            )`,
            `CREATE TABLE IF NOT EXISTS user_plug_cards (
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
            )`,
            `CREATE TABLE IF NOT EXISTS conversations (
                id SERIAL PRIMARY KEY,
                customer_phone TEXT NOT NULL,
                conversation_id_infobip TEXT,
                last_message TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_phone ON conversations(customer_phone)`,
            `CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
                message_id_infobip TEXT UNIQUE,
                from_number TEXT,
                to_number TEXT,
                direction TEXT,
                content JSONB,
                status TEXT DEFAULT 'pending',
                sent_at TIMESTAMP,
                delivered_at TIMESTAMP,
                seen_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE INDEX IF NOT EXISTS idx_messages_conv_id ON messages(conversation_id)`,
            `CREATE TABLE IF NOT EXISTS client_submissions (
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
            )`,
            `CREATE TABLE IF NOT EXISTS step_leads (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                niche TEXT,
                method TEXT,
                volume TEXT,
                status TEXT DEFAULT 'NOVO',
                timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS infobip_templates (
                id TEXT PRIMARY KEY,
                status TEXT NOT NULL,
                user_id INTEGER REFERENCES users(id),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS client_for_client_requests (
                id SERIAL PRIMARY KEY,
                parent_user_id INTEGER REFERENCES users(id),
                submission_id INTEGER REFERENCES client_submissions(id),
                user_id INTEGER REFERENCES users(id),
                data JSONB NOT NULL,
                approved BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS consultative_actions (
                id SERIAL PRIMARY KEY,
                client_name TEXT NOT NULL,
                action_date DATE NOT NULL,
                priority TEXT DEFAULT 'MÉDIA',
                status TEXT DEFAULT 'PENDENTE',
                responsavel TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS submission_change_requests (
                id SERIAL PRIMARY KEY,
                submission_id INTEGER REFERENCES client_submissions(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id),
                requested_data JSONB NOT NULL,
                original_data JSONB NOT NULL,
                status TEXT DEFAULT 'PENDENTE',
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS salesperson_configs (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                commission_percentage NUMERIC DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS finance_sales (
                id SERIAL PRIMARY KEY,
                client_name TEXT NOT NULL,
                client_cpf_cnpj TEXT,
                client_contact TEXT,
                package_hired TEXT,
                quantity_hired INTEGER DEFAULT 0,
                unit_value NUMERIC DEFAULT 0,
                total_value NUMERIC DEFAULT 0,
                sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                salesperson_id INTEGER REFERENCES users(id),
                payment_status TEXT DEFAULT 'PENDENTE',
                payment_competence TEXT,
                commission_status TEXT DEFAULT 'PREVISTA',
                commission_value NUMERIC DEFAULT 0,
                quantity_delivered INTEGER DEFAULT 0,
                investment_used NUMERIC DEFAULT 0,
                campaign_status TEXT DEFAULT 'ATIVA',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS push_subscriptions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                subscription JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, subscription)
            )`,
            `CREATE TABLE IF NOT EXISTS blog_posts (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                excerpt TEXT,
                content TEXT,
                category TEXT,
                author TEXT,
                image TEXT,
                read_time TEXT DEFAULT '5 min',
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS blog_comments (
                id SERIAL PRIMARY KEY,
                post_slug TEXT NOT NULL,
                user_id INTEGER,
                user_name TEXT NOT NULL,
                comment_text TEXT NOT NULL,
                likes INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        // 1. Recreate tables
        for (const sql of tables) {
            const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
            try {
                await client.query(sql);
                console.log(`✅ Table verified/created: ${tableName}`);
            } catch (err) {
                console.error(`❌ Error creating table ${tableName}:`, err.message);
            }
        }

        // 2. Run schema column alterations for backward compatibility
        const safeAlter = async (query) => {
            try { await client.query(query); } catch (e) { /* ignore */ }
        };
        await safeAlter(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'CLIENT'`);
        await safeAlter(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS ads JSONB DEFAULT '[]'`);
        await safeAlter(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDENTE'`);
        await safeAlter(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS accepted_by TEXT`);
        await safeAlter(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS assigned_to TEXT`);
        await safeAlter(`ALTER TABLE shortened_links ADD COLUMN IF NOT EXISTS target_user_id INTEGER REFERENCES users(id)`);
        await safeAlter(`ALTER TABLE shortened_links ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES client_submissions(id)`);
        await safeAlter(`ALTER TABLE shortened_links ADD COLUMN IF NOT EXISTS is_bulk BOOLEAN DEFAULT FALSE`);
        await safeAlter(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS sender_number TEXT`);
        await safeAlter(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS submitted_by TEXT`);
        await safeAlter(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS submitted_role TEXT`);
        await safeAlter(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS user_id INTEGER`);
        await safeAlter(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS notes TEXT`);
        await safeAlter(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS original_button_link TEXT`);
        await safeAlter(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS parent_approved BOOLEAN DEFAULT FALSE`);
        await safeAlter(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS parent_feedback TEXT`);
        await safeAlter(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS origin VARCHAR(50)`);
        await safeAlter(`ALTER TABLE link_clicks ADD COLUMN IF NOT EXISTS country TEXT`);
        await safeAlter(`ALTER TABLE link_clicks ADD COLUMN IF NOT EXISTS city TEXT`);
        await safeAlter(`ALTER TABLE link_clicks ADD COLUMN IF NOT EXISTS region TEXT`);
        await safeAlter(`ALTER TABLE link_clicks ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION`);
        await safeAlter(`ALTER TABLE link_clicks ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION`);
        await safeAlter(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_number TEXT`);
        await safeAlter(`ALTER TABLE users ADD COLUMN IF NOT EXISTS infobip_key TEXT`);
        await safeAlter(`ALTER TABLE users ADD COLUMN IF NOT EXISTS infobip_sender TEXT`);
        await safeAlter(`ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES users(id)`);
        await safeAlter(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_access_token TEXT`);
        await safeAlter(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_refresh_token TEXT`);
        await safeAlter(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_token_expiry BIGINT`);
        await safeAlter(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_calendar_id TEXT`);
        await safeAlter(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_email TEXT`);
        await safeAlter(`ALTER TABLE infobip_templates ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)`);
        await safeAlter(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS summary JSONB`);
        await safeAlter(`ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS logs JSONB DEFAULT '[]'`);
        await safeAlter(`ALTER TABLE client_submissions ADD COLUMN IF NOT EXISTS logs JSONB DEFAULT '[]'`);
        await safeAlter(`ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS data JSONB`);
        await safeAlter(`ALTER TABLE step_leads ADD COLUMN IF NOT EXISTS agent_name TEXT`);
        await safeAlter(`ALTER TABLE user_plug_cards ADD COLUMN IF NOT EXISTS purchased_price NUMERIC`);
        await safeAlter(`ALTER TABLE plug_cards ADD COLUMN IF NOT EXISTS copy TEXT`);
        
        try {
            await client.query(`CREATE TABLE IF NOT EXISTS public.data_log_old (id SERIAL PRIMARY KEY)`);
            await safeAlter(`ALTER TABLE public.data_log_old ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDENTE'`);
            await safeAlter(`ALTER TABLE public.data_log_old ADD COLUMN IF NOT EXISTS campanha_target TEXT`);
        } catch (e) { /* ignore */ }

        console.log("✅ All columns and schemas verified/migrated.");

        // 3. Seed default Plug Cards
        const seedCards = [
            { name: 'PC-10 | Foundation Card', tier: 'foundation', vol: 10000, chips: 5, camps: 1, pri: 'low', speed: 'standard', ban: 'basic', price: 97.00, copy: 'Entrada estratégica para validação de campanhas e aquisição inicial.', features: { resources: ['Templates padrão', 'Tracking básico de clique', 'Dashboard essencial'] } },
            { name: 'PC-20 | Growth Card', tier: 'growth', vol: 20000, chips: 8, camps: 2, pri: 'low', speed: 'stable', ban: 'basic', price: 197.00, copy: 'Primeiro nível de escala com consistência operacional.', features: { resources: ['Personalização de templates', 'Métricas de entrega', 'Histórico de campanhas'] } },
            { name: 'PC-50 | Performance Card', tier: 'performance', vol: 50000, chips: 15, camps: 4, pri: 'medium', speed: 'accelerated', ban: 'pro', price: 497.00, copy: 'Construído para operações que já geram receita consistente.', features: { resources: ['Prioridade média', 'Envio acelerado', 'Suporte priority'] } },
            { name: 'PC-100 | Scale Card', tier: 'velocity', vol: 100000, chips: 25, camps: 10, pri: 'medium', speed: 'high', ban: 'pro', price: 897.00, copy: 'Focado em escala rápida com automação de infraestrutura.', features: { resources: ['Automação de rotação', 'Chips ilimitados (soft)', 'Relatórios avançados'] } },
            { name: 'PC-250 | Domination Card', tier: 'dominance', vol: 250000, chips: 60, camps: 999, pri: 'high', speed: 'turbo', ban: 'enterprise', price: 1997.00, copy: 'Domínio total de mercado com volume massivo e estabilidade.', features: { resources: ['Infra dedicada', 'Warm-up assistido', 'Manager exclusivo'] } },
            { name: 'PC-500 | Apex Card', tier: 'apex', vol: 500000, chips: 150, camps: 999, pri: 'high', speed: 'instant', ban: 'highest', price: 3497.00, copy: 'O ápice da operação Plug & Sales. Máxima escala, mínima fricção.', features: { resources: ['Acesso antecipado beta', 'Customização total', 'Acordo de SLA 99%'] } }
        ];

        for (const card of seedCards) {
            try {
                const checkRes = await client.query('SELECT id FROM plug_cards WHERE name = $1', [card.name]);
                if (checkRes.rows.length === 0) {
                    await client.query(`
                        INSERT INTO plug_cards (name, tier, total_volume, max_chips, max_campaigns, priority_level, speed, anti_ban_level, features, copy, price)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    `, [card.name, card.tier, card.vol, card.chips, card.camps, card.pri, card.speed, card.ban, JSON.stringify(card.features), card.copy, card.price]);
                    console.log(`✅ Seeded Plug Card: ${card.name}`);
                }
            } catch (e) {
                console.error(`❌ Error seeding card ${card.name}:`, e.message);
            }
        }

        // 4. Seed employees & Admin user
        const employees = [
            { name: 'Admin', email: 'admin@plugsales.com.br', password: 'Admin@plugsales2026!', role: 'ADMIN' },
            { name: 'Ricardo Willer', email: 'ricardowiller@plugsales.com.br', role: 'EMPLOYEE' },
            { name: 'Otávio Augusto', email: 'otavioaugusto@plugsales.com.br', role: 'EMPLOYEE' },
            { name: 'Augusto Fagundes', email: 'augustofagundes@plugsales.com.br', role: 'EMPLOYEE' },
            { name: 'Luis Henrique', email: 'luishenrique@plugsales.com.br', role: 'EMPLOYEE' },
            { name: 'Gabriel Martins', email: 'gabrielmartins@plugsales.com.br', role: 'EMPLOYEE' },
            { name: 'Italo Clovis', email: 'italoclovis@plugsales.com.br', role: 'EMPLOYEE' },
            { name: 'Samwell Souza', email: 'samwellsouza@plugsales.com.br', role: 'EMPLOYEE' },
            { name: 'Thales Henrique', email: 'thaleshenrique@plugsales.com.br', role: 'EMPLOYEE' },
            { name: 'Ramon Gomes', email: 'ramongomes@plugsales.com.br', password: 'Ramon@plugsales2026!', role: 'EMPLOYEE' },
            { name: 'Gisele Vieira', email: 'giselevieira@plugsales.com.br', role: 'EMPLOYEE' }
        ];

        for (const emp of employees) {
            const password = emp.password || "PlugSales2026!";
            const role = emp.role || 'EMPLOYEE';
            try {
                const check = await client.query('SELECT id FROM users WHERE email = $1', [emp.email]);
                if (check.rows.length === 0) {
                    await client.query(
                        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
                        [emp.name, emp.email, password, role]
                    );
                    console.log(`✅ Seeded User: ${emp.name} (${emp.email}) | Password: ${password} | Role: ${role}`);
                } else {
                    await client.query(
                        'UPDATE users SET password = $1, role = $2 WHERE email = $3',
                        [password, role, emp.email]
                    );
                    console.log(`ℹ️ Updated User: ${emp.name} (${emp.email}) | Role: ${role}`);
                }
            } catch (err) {
                console.error(`❌ Error seeding user ${emp.name}:`, err.message);
            }
        }
        
        console.log("✨ Database restoration completed successfully! All tables are active and seeded!");
    } catch (err) {
        console.error("❌ Fatal error during recovery execution:", err.message);
    } finally {
        if (client) client.release();
        await pool.end();
        process.exit(0);
    }
}

runRecovery();
