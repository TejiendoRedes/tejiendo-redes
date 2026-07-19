const fs = require('fs');
const path = require('path');

const dir = './src/db/schema';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'index.ts' && f !== 'relations.ts');

let out = '';
for (const f of files) {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    const lines = content.split('\n');
    let inTable = false;
    let tableName = '';

    for (const line of lines) {
        if (line.includes('mysqlTable(')) {
            const match = line.match(/export const (\w+) = mysqlTable\('([^']+)'/);
            if (match) {
                tableName = match[1];
                out += '\n[' + tableName + ']\n';
                inTable = true;
            }
        } else if (inTable) {
            if (line.match(/^\s*\}\);/)) {
                inTable = false;
            } else {
                const fieldMatch = line.match(/^\s*(\w+):\s*([a-zA-Z]+)\('.*?'(?:,\s*\{.*?length:\s*(\d+).*?\})?/);
                if (fieldMatch) {
                    out += `  ${fieldMatch[1]}: ${fieldMatch[2]}(${fieldMatch[3] || ''})\n`;
                } else if (line.match(/^\s*(\w+):/)) {
                    out += `  [unparsed] ${line.trim()}\n`;
                }
            }
        }
    }
}
console.log(out);
