const fs = require('fs');
const path = require('path');

const srcApp = path.join(__dirname, 'src', 'app');
const destFeatures = path.join(__dirname, 'src', 'components', 'features');

if (!fs.existsSync(destFeatures)) {
    fs.mkdirSync(destFeatures, { recursive: true });
}

function processDirectory(dir) {
    const items = fs.readdirSync(dir);
    // Find directories first to recurse safely BEFORE moving things
    const subdirs = items.filter(i => fs.statSync(path.join(dir, i)).isDirectory());

    // Now look for client files
    const clientFiles = items.filter(f => f.toLowerCase().endsWith('client.tsx') || f.toLowerCase().endsWith('-client.tsx'));

    if (clientFiles.length > 0) {
        const domainName = path.basename(dir);
        const featureDir = path.join(destFeatures, domainName);

        if (!fs.existsSync(featureDir)) {
            fs.mkdirSync(featureDir, { recursive: true });
        }

        clientFiles.forEach(file => {
            const oldPath = path.join(dir, file);
            const newPath = path.join(featureDir, file);

            // 1. Move file
            fs.renameSync(oldPath, newPath);
            console.log(`Moved ${file} to ${featureDir}`);

            // 2. Warn if broken imports
            let content = fs.readFileSync(newPath, 'utf8');
            if (content.match(/from\s+['"]\.\.\/[^'"]+['"]/)) {
                console.log(`Warning: ${file} might have broken relative imports.`);
            }

            // 3. Update page.tsx
            const pagePath = path.join(dir, 'page.tsx');
            if (fs.existsSync(pagePath)) {
                let pageContent = fs.readFileSync(pagePath, 'utf8');
                const compName = file.replace('.tsx', '');
                // Regex matches `import Something from './file-client'`
                const rx = new RegExp(`import\\s+([A-Za-z0-9_]+)\\s+from\\s+['"]\\.\\/${compName}['"]`, 'g');
                pageContent = pageContent.replace(rx, `import $1 from '@/components/features/${domainName}/${compName}'`);
                fs.writeFileSync(pagePath, pageContent);
                console.log(`Updated page.tsx in ${dir}`);
            }
        });
    }

    // Now recurse
    subdirs.forEach(sub => {
        processDirectory(path.join(dir, sub));
    });
}

processDirectory(srcApp);
console.log('Finished migrating client components to features.');
