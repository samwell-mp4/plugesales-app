import pool from '../database/db.js';

export const conversationRepository = {
    findByPhone: async (phone) => {
        const result = await pool.query('SELECT * FROM conversations WHERE customer_phone = $1', [phone]);
        return result.rows[0];
    },
    create: async (phone, conversationIdInfobip = null) => {
        const result = await pool.query(
            'INSERT INTO conversations (customer_phone, conversation_id_infobip) VALUES ($1, $2) RETURNING *',
            [phone, conversationIdInfobip]
        );
        return result.rows[0];
    },
    updateLastMessage: async (id, lastMessage) => {
        const result = await pool.query(
            'UPDATE conversations SET last_message = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [lastMessage, id]
        );
        return result.rows[0];
    },
    getAll: async () => {
        const result = await pool.query('SELECT id, customer_phone, last_message, updated_at FROM conversations ORDER BY updated_at DESC');
        return result.rows;
    }
};
