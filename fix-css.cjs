const fs = require('fs');
const path = require('path');
const files = [
    'src/pages/FinanceSuppliers.tsx',
    'src/pages/FinancePayables.tsx',
    'src/pages/FinanceRefunds.tsx',
    'src/pages/FinanceRequests.tsx',
    'src/pages/CollaboratorsRegistration.tsx'
];

files.forEach(f => {
    const fullPath = path.join(__dirname, f);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');

    // Add style block if missing
    if (!content.includes('<style>{`')) {
        content = content.replace(/<div className="crm-layout">/, 
            '<div className="finance-page animate-fade-in" style={{ padding: "40px", paddingBottom: "80px" }}>\n' +
            '            <style>{`\n' +
            '                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }\n' +
            '                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }\n' +
            '            `}</style>'
        );
    }
    
    // Replace header
    content = content.replace(/<div className="crm-header-container">/, '<header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">');
    content = content.replace(/<h1 className="crm-page-title">/g, '<h1>');
    content = content.replace(/<p className="crm-page-subtitle">/g, '<p className="subtitle">');
    content = content.replace(/<\/div>\s*<div className="flex gap-2/g, '</div>\n                <div className="flex gap-2'); // keep the buttons beside
    
    // Replace inputs
    content = content.replace(/className="crm-input(.*?)"/g, 'className="input-field$1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }}');

    // Replace primary buttons
    content = content.replace(/className="btn-primary(.*?)"/g, 'style={{ background: "var(--primary-color)", color: "black", border: "none", borderRadius: "14px", padding: "16px 24px", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} className="$1"');

    // Replace glass panels
    content = content.replace(/className="crm-glass-panel(.*?)"/g, 'style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px", backdropFilter: "blur(20px)" }} className="$1"');

    // Remove stray </header> closing if we didn't add it? Wait, I didn't change the closing `</div>` to `</header>`!
    // We need to change the closing `</div>` of the header section to `</header>`.
    content = content.replace(/<header className="flex(.*?)>([\s\S]*?)<\/div>\s*<div className="flex gap-2(.*?)(<\/div>)\s*<\/div>/, '<header className="flex$1>$2</div><div className="flex gap-2$3</div></header>');
    content = content.replace(/<header className="flex(.*?)>([\s\S]*?)<\/div>\s*<\/div>/, '<header className="flex$1>$2</div></header>');

    fs.writeFileSync(fullPath, content);
});
console.log('Styles updated.');
