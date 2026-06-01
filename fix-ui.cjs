const fs = require('fs');

// 1. FinancePayables.tsx
let p = fs.readFileSync('src/pages/FinancePayables.tsx', 'utf8');
p = p.replace(/className=\`px-6 py-2\.5 rounded-xl text-sm font-bold transition-all \$\{activeTab === 'consulta' \? 'bg-primary-color text-black shadow-lg shadow-primary-color\/20' : 'text-white\/60 hover:text-white'\}\`/g, 
    `style={activeTab === 'consulta' ? { background: 'var(--primary-color)', color: 'black' } : {}} className=\`px-6 py-2.5 rounded-xl text-sm font-bold transition-all \${activeTab === 'consulta' ? 'shadow-lg' : 'text-white/60 hover:text-white'}\``);
p = p.replace(/className=\`px-6 py-2\.5 rounded-xl text-sm font-bold transition-all \$\{activeTab === 'nova' \? 'bg-primary-color text-black shadow-lg shadow-primary-color\/20' : 'text-white\/60 hover:text-white'\}\`/g, 
    `style={activeTab === 'nova' ? { background: 'var(--primary-color)', color: 'black' } : {}} className=\`px-6 py-2.5 rounded-xl text-sm font-bold transition-all \${activeTab === 'nova' ? 'shadow-lg' : 'text-white/60 hover:text-white'}\``);
p = p.replace(/className=\"bg-transparent border-none outline-none text-white w-full text-sm font-bold appearance-none\"/g, 
    'className="filter-select w-full" style={{ background: "transparent", border: "none", color: "white", outline: "none", width: "100%", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}');
fs.writeFileSync('src/pages/FinancePayables.tsx', p);

// 2. FinanceRefunds.tsx
let r = fs.readFileSync('src/pages/FinanceRefunds.tsx', 'utf8');
r = r.replace(/className=\"px-6 py-3 rounded-xl font-bold text-white\/60 hover:text-white transition-colors\">Cancelar<\/button>/g,
    'style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "14px", padding: "16px 24px", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s" }} className="hover:bg-white/5">Cancelar</button>');
fs.writeFileSync('src/pages/FinanceRefunds.tsx', r);

// 3. FinanceRequests.tsx
let req = fs.readFileSync('src/pages/FinanceRequests.tsx', 'utf8');
req = req.replace(/className=\"px-6 py-3 rounded-xl font-bold text-white\/60 hover:text-white\">Cancelar<\/button>/g,
    'style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "14px", padding: "16px 24px", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s" }} className="hover:bg-white/5">Cancelar</button>');
fs.writeFileSync('src/pages/FinanceRequests.tsx', req);

// 4. FinanceSales.tsx
let sales = fs.readFileSync('src/pages/FinanceSales.tsx', 'utf8');
sales = sales.replace(/<div className=\"flex flex-wrap items-center gap-4\" style=\{\{ flex: 1, justifyContent: 'flex-end' \}\}>/, 
    '<div className="flex flex-wrap items-center gap-4 w-full xl:w-auto xl:flex-nowrap mt-4 xl:mt-0" style={{ flex: 1, justifyContent: "flex-start" }}>');
sales = sales.replace(/style=\{\{ display: 'flex', flexDirection: 'column', gap: '4px', alignSelf: 'flex-end' \}\}/g, 
    'style={{ display: "flex", flexDirection: "column", gap: "4px" }}');
sales = sales.replace(/<div className=\"search-bar-finance\">/g, 
    '<div className="search-bar-finance w-full md:w-auto">');
fs.writeFileSync('src/pages/FinanceSales.tsx', sales);

console.log('UI Fixes applied.');
