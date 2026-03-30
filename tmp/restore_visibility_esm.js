import fs from 'fs';
const path = 'c:/Users/Usuario/Plug & Sales/server.js';
let content = fs.readFileSync(path, 'utf8');

const regex = /app\.get\('\/api\/client\/submissions', async \(req, res\) => \{[\s\S]*?res\.json\(submissions \|\| \[\]\);/;

const replacement = `app.get('/api/client/submissions', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId é obrigatório.' });
    try {
        const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
        const userRole = userRes.rows[0]?.role || 'CLIENT';

        let query = \`
            SELECT c.*, u.name as child_name 
            FROM client_submissions c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE (c.user_id = $1 OR u.parent_id = $1)
        \`;

        if (userRole === 'CLIENT') {
            query += \` AND (c.user_id = $1 OR (c.submitted_role NOT IN ('ADMIN', 'EMPLOYEE') OR c.submitted_role IS NULL))\`;
            query += \` AND (c.status != 'AGUARDANDO_APROVACAO_PAI' OR u.parent_id = $1)\`;
        }

        query += \` ORDER BY c.timestamp DESC\`;
        const result = await pool.query(query, [userId]);

        const submissions = result.rows.map(s => ({
            ...s,
            is_referral: s.user_id && Number(s.user_id) !== Number(userId)
        }));

        res.json(submissions || []);`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('✅ Visibility restoration applied successfully.');
} else {
    console.error('❌ Could not find target submissions endpoint in server.js');
}
