import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const uploadsDir = './uploads';

function searchSpreadsheets(term) {
    console.log(`Searching local files in ${uploadsDir} for "${term}"...`);
    
    if (!fs.existsSync(uploadsDir)) {
        console.log("No uploads directory found.");
        return;
    }
    
    const files = fs.readdirSync(uploadsDir);
    
    for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const ext = path.extname(file).toLowerCase();
        
        if (ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
            try {
                const workbook = XLSX.readFile(filePath);
                let foundInFile = [];
                
                for (const sheetName of workbook.SheetNames) {
                    const worksheet = workbook.Sheets[sheetName];
                    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    rows.forEach((row, rowIndex) => {
                        const rowStr = JSON.stringify(row).toLowerCase();
                        if (rowStr.includes(term.toLowerCase())) {
                            foundInFile.push({ sheetName, rowIndex: rowIndex + 1, data: row });
                        }
                    });
                }
                
                if (foundInFile.length > 0) {
                    console.log(`\n✅ FOUND in file: ${file} (${foundInFile.length} matching rows):`);
                    foundInFile.slice(0, 10).forEach(match => {
                        console.log(` - Sheet [${match.sheetName}] Row ${match.rowIndex}:`, match.data);
                    });
                    if (foundInFile.length > 10) {
                        console.log(` ... and ${foundInFile.length - 10} more matches in this file.`);
                    }
                }
            } catch (e) {
                console.error(`Error reading ${file}:`, e.message);
            }
        }
    }
}

searchSpreadsheets('vitoria');
searchSpreadsheets('vitória');
