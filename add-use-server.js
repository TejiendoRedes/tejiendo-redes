const fs = require('fs');
const path = require('path');

const queriesDir = path.join(__dirname, 'src', 'queries');

function addUseServer(dir) {
    if (!fs.existsSync(dir)) return;

    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            addUseServer(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (!content.includes("'use server'") && !content.includes('"use server"')) {
                // Prepend 'use server';
                content = `"use server";\n\n` + content;
                fs.writeFileSync(fullPath, content);
                console.log(`Added "use server" to ${file}`);
            }
        }
    });
}

addUseServer(queriesDir);
console.log('Finished updating src/queries.');
