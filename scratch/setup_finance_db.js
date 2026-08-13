import pg from 'pg';
import { pgUrl } from '../backend/database/db.js';

const { Pool } = pg;
const pool = new Pool({ connectionString: pgUrl });

async function setup() {
    try {
        console.log("Initializing database schema for finance features...");
        
        // 1. Add columns to users table if not exists
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_receivable DECIMAL(10, 2) DEFAULT 0.00;
        `);
        console.log("Column 'monthly_receivable' verified/added to 'users'.");

        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS pix_key VARCHAR(255);
        `);
        console.log("Column 'pix_key' verified/added to 'users'.");

        // 2. Create employee_competences table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS employee_competences (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                competence VARCHAR(20) NOT NULL,
                nf_url TEXT,
                nf_uploaded_at TIMESTAMP WITH TIME ZONE,
                UNIQUE(user_id, competence)
            );
        `);
        console.log("Table 'employee_competences' verified/created.");

        // 3. Create advance_requests table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS advance_requests (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                competence VARCHAR(20) NOT NULL,
                value DECIMAL(10, 2) NOT NULL,
                pix_key VARCHAR(255) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'Pendente',
                justification TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                responded_at TIMESTAMP WITH TIME ZONE
            );
        `);
        console.log("Table 'advance_requests' verified/created.");

        console.log("Database setup completed successfully.");
    } catch (e) {
        console.error("Error setting up database:", e);
    } finally {
        await pool.end();
    }
}

setup();
