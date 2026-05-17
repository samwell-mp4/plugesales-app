import fs from 'fs';
import path from 'path';

function searchDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            searchDirectory(filePath);
        } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
            const content = fs.readFileSync(filePath, 'utf-8');
            if (content.includes('type Role') || content.includes('interface User') || content.includes('role:')) {
                console.log(`Found relevant matches in: ${filePath}`);
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if (line.includes('Role') || line.includes('role')) {
                        console.log(`  ${idx+1}: ${line.trim()}`);
                    }
                });
            }
        }
    }
}

searchDirectory('./src');
