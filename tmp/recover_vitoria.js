import fs from 'fs';
import readline from 'readline';

async function searchVitoria() {
    console.log("Scanning server_log.txt for 'Vitoria' or 'Vitória'...");
    
    const fileStream = fs.createReadStream('./server_log.txt');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    
    let lineNum = 0;
    let matches = [];
    
    for await (const line of rl) {
        lineNum++;
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('vitoria') || lowerLine.includes('vitória')) {
            matches.push({ lineNum, content: line });
        }
    }
    
    console.log(`Found ${matches.length} matches in the logs:`);
    matches.forEach(m => {
        console.log(`\nLine ${m.lineNum}:`);
        console.log(m.content.trim().slice(0, 1000)); // Print up to 1000 characters
    });
}

searchVitoria().catch(err => console.error(err));
