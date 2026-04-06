
import pg from 'pg';
const { Pool } = pg;

const pgUrl = "postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/plug_sales_dispatch_app?sslmode=disable";
const pool = new Pool({ connectionString: pgUrl });

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('--- Database Migration: Credit Economy ---');
        
        // 1. Update plug_cards
        console.log('Updating plug_cards table...');
        await client.query(`
            ALTER TABLE plug_cards 
            ADD COLUMN IF NOT EXISTS code TEXT,
            ADD COLUMN IF NOT EXISTS credits_amount INTEGER,
            ADD COLUMN IF NOT EXISTS speed_level TEXT,
            ADD COLUMN IF NOT EXISTS features_json JSONB DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL',
            ADD COLUMN IF NOT EXISTS can_refund BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS refund_window_hours INTEGER DEFAULT 168,
            ADD COLUMN IF NOT EXISTS refund_fee_type TEXT DEFAULT 'percentage',
            ADD COLUMN IF NOT EXISTS refund_fee_value NUMERIC DEFAULT 10,
            ADD COLUMN IF NOT EXISTS can_gift BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS gift_min_amount INTEGER DEFAULT 100,
            ADD COLUMN IF NOT EXISTS gift_max_amount INTEGER DEFAULT 50000,
            ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        `);
        
        // Ensure UNIQUE(name) for ON CONFLICT
        try {
            await client.query('ALTER TABLE plug_cards ADD CONSTRAINT plug_cards_name_unique UNIQUE (name)');
            console.log('Added unique constraint on plug_cards.name');
        } catch (e) {
            console.log('Constraint plug_cards_name_unique might already exist.');
        }

        // Data migration for existing columns
        await client.query(`UPDATE plug_cards SET credits_amount = total_volume WHERE credits_amount IS NULL`);
        await client.query(`UPDATE plug_cards SET speed_level = speed WHERE speed_level IS NULL`);
        await client.query(`UPDATE plug_cards SET features_json = features WHERE features_json IS NULL OR features_json = '{}'`);

        // 2. User Wallets
        console.log('Creating user_wallets...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_wallets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) UNIQUE,
                total_credits_acquired INTEGER DEFAULT 0,
                total_credits_available INTEGER DEFAULT 0,
                total_credits_reserved INTEGER DEFAULT 0,
                total_credits_used INTEGER DEFAULT 0,
                total_credits_refunded INTEGER DEFAULT 0,
                total_credits_gifted_out INTEGER DEFAULT 0,
                total_credits_gifted_in INTEGER DEFAULT 0,
                wallet_status TEXT DEFAULT 'active',
                risk_level TEXT DEFAULT 'low',
                refund_blocked BOOLEAN DEFAULT FALSE,
                transfer_blocked BOOLEAN DEFAULT FALSE,
                max_daily_gift_amount INTEGER DEFAULT 100000,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. User Card Purchases
        console.log('Creating user_card_purchases...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_card_purchases (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                plug_card_id INTEGER REFERENCES plug_cards(id),
                purchase_reference TEXT UNIQUE,
                card_code TEXT,
                card_name TEXT,
                credits_origin_total INTEGER DEFAULT 0,
                credits_available INTEGER DEFAULT 0,
                credits_reserved INTEGER DEFAULT 0,
                credits_used INTEGER DEFAULT 0,
                credits_refunded INTEGER DEFAULT 0,
                credits_expired INTEGER DEFAULT 0,
                price_paid NUMERIC(10,2),
                currency TEXT DEFAULT 'BRL',
                purchase_status TEXT DEFAULT 'pending',
                refund_status TEXT DEFAULT 'none',
                purchased_at TIMESTAMPTZ,
                refund_deadline_at TIMESTAMPTZ,
                expires_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 4. Credit Ledger
        console.log('Creating credit_ledger...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS credit_ledger (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                wallet_id INTEGER REFERENCES user_wallets(id),
                purchase_id INTEGER REFERENCES user_card_purchases(id),
                related_gift_card_id INTEGER,
                related_campaign_id INTEGER,
                entry_type TEXT NOT NULL,
                direction TEXT NOT NULL,
                amount INTEGER NOT NULL,
                balance_before INTEGER,
                balance_after INTEGER,
                reserved_before INTEGER,
                reserved_after INTEGER,
                metadata_json JSONB DEFAULT '{}',
                created_by_system BOOLEAN DEFAULT TRUE,
                created_by_user_id INTEGER,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 5. Campaign Credit Reservations
        console.log('Creating campaign_credit_reservations...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS campaign_credit_reservations (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                campaign_reference TEXT,
                purchase_id INTEGER REFERENCES user_card_purchases(id),
                requested_credits INTEGER DEFAULT 0,
                reserved_credits INTEGER DEFAULT 0,
                consumed_credits INTEGER DEFAULT 0,
                released_credits INTEGER DEFAULT 0,
                reservation_status TEXT DEFAULT 'pending',
                expires_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 6. Gift Cards
        console.log('Creating gift_cards...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS gift_cards (
                id SERIAL PRIMARY KEY,
                code TEXT UNIQUE NOT NULL,
                creator_user_id INTEGER REFERENCES users(id),
                source_purchase_id INTEGER REFERENCES user_card_purchases(id),
                source_wallet_id INTEGER REFERENCES user_wallets(id),
                amount INTEGER NOT NULL,
                fee_amount INTEGER DEFAULT 0,
                final_locked_amount INTEGER NOT NULL,
                recipient_user_id INTEGER,
                recipient_email TEXT,
                recipient_phone TEXT,
                gift_status TEXT DEFAULT 'pending',
                expires_at TIMESTAMPTZ,
                redeemed_at TIMESTAMPTZ,
                cancelled_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 7. Refund Requests
        console.log('Creating refund_requests...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS refund_requests (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                purchase_id INTEGER REFERENCES user_card_purchases(id),
                requested_credits INTEGER NOT NULL,
                eligible_credits INTEGER,
                refund_fee_credits INTEGER,
                refundable_credits INTEGER,
                refund_value_money NUMERIC(10,2),
                reason TEXT,
                request_status TEXT DEFAULT 'pending',
                requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                reviewed_at TIMESTAMPTZ,
                reviewed_by INTEGER,
                metadata_json JSONB DEFAULT '{}',
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 8. Fraud Events
        console.log('Creating fraud_events...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS fraud_events (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                event_type TEXT NOT NULL,
                severity TEXT DEFAULT 'low',
                description TEXT,
                metadata_json JSONB DEFAULT '{}',
                action_taken TEXT,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 9. Admin Credit Actions
        console.log('Creating admin_credit_actions...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_credit_actions (
                id SERIAL PRIMARY KEY,
                admin_user_id INTEGER REFERENCES users(id),
                target_user_id INTEGER REFERENCES users(id),
                action_type TEXT NOT NULL,
                amount INTEGER,
                reason TEXT,
                metadata_json JSONB DEFAULT '{}',
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 10. Initial Seed for 8 Cards
        console.log('Seeding/Updating the 8 official cards...');
        const seedCards = [
            { code: 'PC-10',  name: 'PC-10 | Foundation Card',  tier: 'foundation',  vol: 10000,   chips: 5,   camps: 1,   pri: 'low',    speed: 'standard', ban: 'basic',     price: 97.00,   display: 1, copy: 'Entrada estratégica para validação de campanhas e aquisição inicial.' },
            { code: 'PC-20',  name: 'PC-20 | Growth Card',      tier: 'growth',      vol: 20000,   chips: 8,   camps: 2,   pri: 'low',    speed: 'stable',   ban: 'basic',     price: 197.00,  display: 2, copy: 'Primeiro nível de escala com consistência operacional.' },
            { code: 'PC-50',  name: 'PC-50 | Performance Card', tier: 'performance', vol: 50000,   chips: 15,  camps: 4,   pri: 'medium', speed: 'fast',     ban: 'pro',       price: 497.00,  display: 3, copy: 'Construído para operações que já geram receita consistente.' },
            { code: 'PC-100', name: 'PC-100 | Velocity Card',   tier: 'velocity',    vol: 100000,  chips: 25,  camps: 10,  pri: 'medium', speed: 'high',     ban: 'pro',       price: 897.00,  display: 4, copy: 'Focado em escala rápida com automação de infraestrutura.' },
            { code: 'PC-150', name: 'PC-150 | Dominance Card',  tier: 'dominance',   vol: 150000,  chips: 40,  camps: 20,  pri: 'high',   speed: 'ultra',    ban: 'pro',       price: 1297.00, display: 5, copy: 'Dominação de nicho com alta taxa de entrega e volume robusto.' },
            { code: 'PC-500', name: 'PC-500 | Elite Card',      tier: 'elite',       vol: 500000,  chips: 80,  camps: 50,  pri: 'high',   speed: 'turbo',    ban: 'enterprise', price: 3497.00, display: 6, copy: 'Elite operacional. Máxima performance e suporte prioritário.' },
            { code: 'PC-1M',  name: 'PC-1M | Sovereign Card',   tier: 'sovereign',   vol: 1000000, chips: 150, camps: 100, pri: 'extreme', speed: 'instant',  ban: 'enterprise', price: 5997.00, display: 7, copy: 'Soberania total de mercado. Capacidade massiva ilimitada.' },
            { code: 'PC-X',   name: 'PC-X | Apex Card',         tier: 'apex',        vol: 2500000, chips: 500, camps: 999, pri: 'godlike', speed: 'lightspeed', ban: 'apex',      price: 12997.00, display: 8, copy: 'O ápice da tecnologia Plug & Sales. Escala global extrema.' }
        ];

        for (const card of seedCards) {
            await client.query(`
                INSERT INTO plug_cards (code, name, tier, credits_amount, total_volume, max_chips, max_campaigns, priority_level, speed_level, speed, anti_ban_level, price, display_order, copy, features_json, is_active)
                VALUES ($1, $2, $3, $4, $4, $5, $6, $7, $8, $8, $9, $10, $11, $12, $13, TRUE)
                ON CONFLICT (name) DO UPDATE SET 
                    code = $1,
                    tier = $3,
                    credits_amount = $4,
                    total_volume = $4,
                    max_chips = $5,
                    max_campaigns = $6,
                    priority_level = $7,
                    speed_level = $8,
                    speed = $8,
                    anti_ban_level = $9,
                    price = $10,
                    display_order = $11,
                    copy = $12,
                    updated_at = NOW()
            `, [card.code, card.name, card.tier, card.vol, card.chips, card.camps, card.pri, card.speed, card.ban, card.price, card.display, card.copy, JSON.stringify({})]);
        }

        // 11. Create wallets for existing users
        console.log('Creating wallets for existing users...');
        await client.query(`
            INSERT INTO user_wallets (user_id)
            SELECT id FROM users
            ON CONFLICT (user_id) DO NOTHING
        `);

        console.log('✅ Migration completed successfully.');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
