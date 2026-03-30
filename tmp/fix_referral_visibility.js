import fs from 'fs';
const path = 'c:/Users/Usuario/Plug & Sales/server.js';
let content = fs.readFileSync(path, 'utf8');

const regex = /app\.get\('\/api\/referral-submissions\/:parentId', async \(req, res\) => \{[\s\S]*?ORDER BY s\.timestamp DESC\`,/;

const replacement = `app.get('/api/referral-submissions/:parentId', async (req, res) => {
    const { parentId } = req.params;
    try {
        // Fetch submissions from users whose parent is parentId but EXCLUDE those created by ADMIN/EMPLOYEE
        const result = await pool.query(
            \`SELECT s.* FROM client_submissions s 
             JOIN users u ON s.user_id = u.id 
             WHERE u.parent_id = $1 
             AND (s.submitted_role NOT IN ('ADMIN', 'EMPLOYEE') OR s.submitted_role IS NULL)
             ORDER BY s.timestamp DESC\`,`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('✅ Referral visibility fix applied successfully.');
} else {
    console.error('❌ Could not find target referral endpoint in server.js');
}
