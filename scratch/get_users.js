import fs from 'fs';

try {
    const file = fs.readFileSync('server.js', 'utf8');
    const lines = file.split('\n');
    lines.forEach((l, idx) => {
        if (l.includes('competences-spreadsheet')) {
            console.log(`Line ${idx + 1}: ${l}`);
        }
    });
} catch (err) {
    console.error(err);
}
process.exit(0);
