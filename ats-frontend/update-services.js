// Script to update all service files to use environment.apiUrl
// Run this with: node update-services.js

const fs = require('fs');
const path = require('path');

const servicesDir = './src/app/services';
const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.service.ts'));

files.forEach(file => {
    const filePath = path.join(servicesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already updated
    if (content.includes('from \'../../environments/environment\'')) {
        console.log(`Skipped ${file} - already updated`);
        return;
    }

    // Add import after other imports
    const importRegex = /(import.*from.*;\r?\n)+/;
    const match = content.match(importRegex);
    if (match) {
        const lastImport = match[0];
        content = content.replace(lastImport, lastImport + "import { environment } from '../../environments/environment';\r\n");
    }

    // Replace localhost URLs
    content = content.replace(
        /private apiUrl = 'http:\/\/localhost:8080\/api\/([^']+)';/g,
        "private apiUrl = `${environment.apiUrl}/$1`;"
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
});

console.log('All services updated!');
