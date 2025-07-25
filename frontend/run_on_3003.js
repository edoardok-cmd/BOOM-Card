// Script to update port and run the app on 3003
const fs = require('fs');
const { spawn } = require('child_process');

// Update package.json to use port 3003
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.scripts.dev = "next dev -p 3003";
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

console.log('✅ Updated package.json to use port 3003');
console.log('🚀 Starting BOOM Card (original TypeScript version) on port 3003...');

// Start the dev server
const devServer = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

devServer.on('error', (err) => {
  console.error('Failed to start dev server:', err);
});