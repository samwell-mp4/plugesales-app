import fs from 'fs';

try {
    const content = fs.readFileSync('./server_log_utf8.txt', 'utf-8');
    const lines = content.split('\n');
    console.log("Searching server_log_utf8.txt for 'vitoria' or 'vitória'...");
    
    let matches = 0;
    lines.forEach((line, index) => {
        const lower = line.toLowerCase();
        if (lower.includes('vitoria') || lower.includes('vitória')) {
            console.log(`${index + 1}: ${line.trim()}`);
            matches++;
        }
    });
    console.log(`Found ${matches} matches in server_log_utf8.txt.`);
} catch (e) {
    console.error("Error reading file:", e.message);
}
