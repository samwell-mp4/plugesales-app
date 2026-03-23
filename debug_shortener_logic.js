
function ensureProtocol(url) {
    if (!url) return '';
    const trimmed = url.trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

const testUrls = [
    "google.com",
    "http://example.com",
    "https://github.com",
    "  ftp://mysite.com",
    "samwellmidia.com.br"
];

console.log("--- Testing Protocol Normalization ---");
testUrls.forEach(url => {
    console.log(`Original: [${url}] -> Normalized: [${ensureProtocol(url)}]`);
});

const shortCodes = [
    "CODE123",
    "code123",
    "SamwellMidia.com.br",
    "samwellmidia.com.br"
];

console.log("\n--- Testing Case-Insensitivity Concept ---");
shortCodes.forEach(code => {
    console.log(`Code: [${code}] -> Lowercase (for DB lookup): [${code.toLowerCase()}]`);
});
