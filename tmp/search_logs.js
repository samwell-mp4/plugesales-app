import fs from 'fs';

try {
    const content = fs.readFileSync('./server_log_utf8.txt', 'utf-8');
    const lines = content.split('\n');
    
    console.log("Searching logs for database-related events...");
    let matches = 0;
    lines.forEach((line, index) => {
        if (line.includes('postgres://') || line.includes('db.js') || line.includes('DB ERROR') || line.includes('initDB')) {
            if (matches < 50) {
                console.log(`${index + 1}: ${line.trim()}`);
                matches++;
            }
        }
    });
} catch (e) {
    console.error("Error reading logs:", e.message);
}
