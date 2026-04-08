import pool from '../database/db.js';

export const messageRepository = {
    create: async (data) => {
        const { 
            conversation_id, message_id_infobip, from_number, to_number, 
            direction, content, status, sent_at 
        } = data;
        const result = await pool.query(
            `INSERT INTO messages 
            (conversation_id, message_id_infobip, from_number, to_number, direction, content, status, sent_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`,
            [conversation_id, message_id_infobip, from_number, to_number, direction, content, status, sent_at]
        );
        return result.rows[0];
    },
    updateStatus: async (messageIdInfobip, status, timestamp, type = 'delivered') => {
        const timeColumn = type === 'delivered' ? 'delivered_at' : 'seen_at';
        const result = await pool.query(
            `UPDATE messages SET status = $1, ${timeColumn} = $2 WHERE message_id_infobip = $3 RETURNING *`,
            [status, timestamp, messageIdInfobip]
        );
        return result.rows[0];
    },
    findByInfobipId: async (id) => {
        const result = await pool.query('SELECT * FROM messages WHERE message_id_infobip = $1', [id]);
        return result.rows[0];
    },
    getHistoryByConversationId: async (conversationId) => {
        const result = await pool.query(
            'SELECT id, message_id_infobip, from_number, to_number, direction, content, status, sent_at, delivered_at, seen_at FROM messages WHERE conversation_id = $1 ORDER BY sent_at ASC',
            [conversationId]
        );
        return result.rows;
    }
};
