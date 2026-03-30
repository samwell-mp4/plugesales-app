const fs = require('fs');
const path = 'c:\\Users\\Usuario\\Plug & Sales\\server.js';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const startIdx = 974; // line 975 (0-indexed)
const endIdx = 997;   // line 998 (0-indexed)

const replacement = `app.get('/api/client/submissions', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId é obrigatório.' });
    try {
        // Find the requester's role
        const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
        const userRole = userRes.rows[0]?.role || 'CLIENT';

        // Hierarchical Visibility: Show own AND children's submissions
        let query = \`
            SELECT c.*, u.name as child_name 
            FROM client_submissions c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE (c.user_id = $1 OR u.parent_id = $1)
        \`;

        // STRICT SECURITY: If the logged in user is a CLIENT, they 
        // MUST NOT see anything created by ADMIN or EMPLOYEE
        if (userRole === 'CLIENT') {
            query += \` AND (c.submitted_role NOT IN ('ADMIN', 'EMPLOYEE') OR c.submitted_role IS NULL)\`;
            // Also hide submissions waiting for parent approval unless they are the parent
            query += \` AND (c.status != 'AGUARDANDO_APROVACAO_PAI' OR u.parent_id = $1)\`;
        }

        query += \` ORDER BY c.timestamp DESC\`;
        const result = await pool.query(query, [userId]);

        // Mark referral submissions
        const submissions = result.rows.map(s => ({
            ...s,
            is_referral: s.user_id && Number(s.user_id) !== Number(userId)
        }));

        res.json(submissions || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});`;

lines.splice(startIdx, endIdx - startIdx + 1, replacement);
fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('✅ Replacement in server.js successful.');
