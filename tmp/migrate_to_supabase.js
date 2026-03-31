import pg from 'pg';

const { Pool } = pg;

const srcPool = new Pool({ 
    connectionString: 'postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/plug_sales_dispatch_app?sslmode=disable' 
});

const dstPool = new Pool({ 
    connectionString: 'postgresql://postgres:Marketing%40plugsales2026!@db.hpwahwsbtqvfyutosfyr.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        // Create tables in Supabase
        await dstPool.query(`
            CREATE TABLE IF NOT EXISTS plug_cards (
                id SERIAL PRIMARY KEY,
                name TEXT,
                tier TEXT,
                total_volume INTEGER,
                max_chips INTEGER,
                max_campaigns INTEGER,
                priority_level TEXT DEFAULT 'medium',
                speed TEXT DEFAULT 'normal',
                anti_ban_level TEXT DEFAULT 'basic',
                features JSONB DEFAULT '{}',
                copy TEXT,
                price NUMERIC DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela plug_cards criada/verificada no Supabase');

        await dstPool.query(`
            CREATE TABLE IF NOT EXISTS user_plug_cards (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                plug_card_id INTEGER,
                total_volume INTEGER DEFAULT 0,
                used_volume INTEGER DEFAULT 0,
                remaining_volume INTEGER DEFAULT 0,
                active_campaigns INTEGER DEFAULT 0,
                status TEXT DEFAULT 'active',
                payment_method TEXT,
                payment_ref TEXT,
                purchased_price NUMERIC DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela user_plug_cards criada/verificada no Supabase');

        // Fetch all cards from source
        const cards = await srcPool.query('SELECT * FROM plug_cards ORDER BY id');
        console.log(`📦 ${cards.rows.length} cards encontrados no banco original`);

        let migrated = 0;
        let skipped = 0;

        for (const c of cards.rows) {
            try {
                await dstPool.query(
                    `INSERT INTO plug_cards 
                        (id, name, tier, total_volume, max_chips, max_campaigns, priority_level, speed, anti_ban_level, features, copy, price, is_active, created_at) 
                     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) 
                     ON CONFLICT (id) DO UPDATE SET 
                        name=EXCLUDED.name, 
                        tier=EXCLUDED.tier,
                        total_volume=EXCLUDED.total_volume,
                        price=EXCLUDED.price,
                        is_active=EXCLUDED.is_active`,
                    [c.id, c.name, c.tier, c.total_volume, c.max_chips, c.max_campaigns, 
                     c.priority_level, c.speed, c.anti_ban_level, c.features, c.copy, 
                     c.price, c.is_active, c.created_at]
                );
                migrated++;
            } catch(e) {
                console.error(`❌ Erro no card ID ${c.id} (${c.name}):`, e.message);
                skipped++;
            }
        }

        console.log(`✅ Migração concluída: ${migrated} cards migrados, ${skipped} erros`);

        // Reset the sequence so new inserts get the right IDs
        await dstPool.query(`SELECT setval(pg_get_serial_sequence('plug_cards', 'id'), COALESCE(MAX(id), 1)) FROM plug_cards`);
        console.log('✅ Sequence resetada');

        // Verify
        const check = await dstPool.query('SELECT COUNT(*) FROM plug_cards');
        console.log('📊 Total no Supabase:', check.rows[0].count, 'cards');

    } catch (err) {
        console.error('❌ Erro fatal:', err.message);
    } finally {
        await srcPool.end();
        await dstPool.end();
    }
}

migrate();
