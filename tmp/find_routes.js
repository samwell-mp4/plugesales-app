import fs from 'fs';

const content = fs.readFileSync('./server.js', 'utf-8');
const lines = content.split('\n');

console.log("Searching for express routes in server.js...");
lines.forEach((line, index) => {
    if (line.includes('app.post(') || line.includes('app.get(') || line.includes('app.use(')) {
        console.log(`${index + 1}: ${line.trim()}`);
    }
});
