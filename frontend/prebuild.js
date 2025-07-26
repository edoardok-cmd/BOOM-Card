#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Running prebuild cleanup...');

// Remove any files that might cause issues
const filesToRemove = [
  'src/pages/index-simple-backup.tsx.bak',
  'src/pages/index-temp.tsx.bak',
  'src/pages/dashboard-with-layout.tsx.bak',
];

filesToRemove.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Removed: ${file}`);
  }
});

// Ensure _document.js is the only file with document imports
const pagesDir = path.join(__dirname, 'src/pages');
const checkFile = (filePath) => {
  if (filePath.includes('_document')) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('next/document') || 
        content.includes('<Html') || 
        content.includes('</Html>') ||
        (content.includes('<Main') && !content.includes('HTMLMain')) ||
        content.includes('<NextScript')) {
      console.warn(`WARNING: Found document-related code in ${filePath}`);
    }
  } catch (err) {
    // Ignore
  }
};

const walkDir = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      checkFile(filePath);
    }
  });
};

console.log('Checking for document imports outside _document.js...');
walkDir(pagesDir);

console.log('Prebuild cleanup complete!');