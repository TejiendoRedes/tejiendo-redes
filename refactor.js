const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');
const queriesDir = path.join(srcDir, 'queries');

// 1. Rename files in src/queries/
const queryFiles = fs.readdirSync(queriesDir);
for (const file of queryFiles) {
    if (file.endsWith('-actions.ts')) {
        const newName = file.replace('-actions.ts', '.ts');
        fs.renameSync(path.join(queriesDir, file), path.join(queriesDir, newName));
    }
}

// 2. Global replace and 3. Remove stubs
function walk(dir, callback) {
    if (dir.includes('node_modules') || dir.includes('.next')) return;
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walk(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const stubPatterns = [
    /\/\*\*\s*\n\s*\*\s*(Crear|Actualizar|Eliminar|Activar|Desactivar)\s.*?\s*\*\/\s*\n?/g,
];

walk(srcDir, (filePath) => {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content;

        // Replace imports: '@/queries/xxx-actions' -> '@/queries/xxx'
        // And '../queries/xxx-actions' -> '../queries/xxx'
        newContent = newContent.replace(/(queries\/[a-zA-Z0-9_\-]+)-actions/g, '$1');

        if (filePath.includes(path.join('src', 'queries'))) {
            stubPatterns.forEach(p => {
                newContent = newContent.replace(p, '');
            });
            newContent = newContent.replace(/\n{3,}/g, '\n\n');
        }

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Updated ' + path.basename(filePath));
        }
    }
});
