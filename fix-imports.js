const fs = require('fs');
const path = require('path');

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let c = fs.readFileSync(fullPath, 'utf8');
            let newC = c;
            let changed = false;

            const rx = /import\s*\{([^}]+)\}\s*from\s*['"]@\/actions\/([^'"]+)['"]/g;
            let match;

            while ((match = rx.exec(c)) !== null) {
                let names = match[1].split(',').map(n => n.trim());
                let getNames = names.filter(n => n.startsWith('get'));
                let restNames = names.filter(n => !n.startsWith('get'));

                if (getNames.length > 0) {
                    changed = true;
                    let rep = '';
                    if (restNames.length > 0) {
                        rep += `import { ${restNames.join(', ')} } from '@/actions/${match[2]}';\n`;
                    }
                    rep += `import { ${getNames.join(', ')} } from '@/queries/${match[2]}';`;
                    newC = newC.replace(match[0], rep);
                }
            }

            if (changed) {
                fs.writeFileSync(fullPath, newC);
                console.log('Fixed ' + fullPath);
            }
        }
    });
}

processDir('./src/components');
processDir('./src/app');
processDir('./src/__tests__');
console.log('Done!');
