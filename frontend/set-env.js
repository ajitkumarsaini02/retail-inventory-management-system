const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');

// Read API_BASE_URL from environment if available
const apiUrl = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8080';

const envConfigFile = `export const environment = {
  production: true,
  apiBaseUrl: '${apiUrl.replace(/\/+$/, '')}'
};
`;

fs.writeFileSync(targetPath, envConfigFile, 'utf8');
console.log(`[set-env] Generated environment.prod.ts with apiBaseUrl: ${apiUrl}`);
