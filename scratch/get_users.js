import fs from 'fs';

try {
    const file = fs.readFileSync('src/pages/ClientDashboard.tsx', 'utf8');
    const lines = file.split('\n');
    lines.forEach((l, idx) => {
        if (l.toLowerCase().includes('saldo') || l.toLowerCase().includes('disparo') || l.toLowerCase().includes('crédito') || l.toLowerCase().includes('credito')) {
            console.log(`Line ${idx + 1}: ${l}`);
        }
    });
} catch (err) {
    console.error(err);
}
process.exit(0);
