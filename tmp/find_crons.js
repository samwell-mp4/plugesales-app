import fs from 'fs';

const content = fs.readFileSync('./server.js', 'utf-8');
const lines = content.split('\n');

console.log("Searching for cron jobs in server.js...");
lines.forEach((line, index) => {
    if (line.includes('cron.schedule') || line.includes('backup') || line.includes('dump')) {
        console.log(`${index + 1}: ${line.trim()}`);
    }
});
