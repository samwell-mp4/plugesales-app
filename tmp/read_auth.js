import fs from 'fs';

const content = fs.readFileSync('./server.js', 'utf-8');
const lines = content.split('\n');

for (let i = 1740; i < 1825; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
}
