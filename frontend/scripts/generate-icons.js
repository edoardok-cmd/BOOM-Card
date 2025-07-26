#!/usr/bin/env node

/**
 * Generate PWA icons in various sizes from a base SVG
 */

const fs = require('fs');
const path = require('path');

// SVG template for BOOM Card icon
const svgTemplate = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F7931E;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#gradient)" />
  
  <!-- White inner circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - size/8}" fill="white" opacity="0.9" />
  
  <!-- BOOM text -->
  <text x="${size/2}" y="${size/2 + size/8}" 
        font-family="Arial Black, sans-serif" 
        font-size="${size/3.5}px" 
        font-weight="900"
        fill="#FF6B35" 
        text-anchor="middle">
    BOOM
  </text>
</svg>`;

// Icon sizes required for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Ensure icons directory exists
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons for each size
iconSizes.forEach(size => {
  const svg = svgTemplate(size);
  const filename = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Generated ${filename}`);
});

// Generate a simple PNG placeholder for each size
// In production, you would use a proper SVG to PNG converter like sharp or puppeteer
iconSizes.forEach(size => {
  // Create a simple colored square as PNG placeholder
  // This is a minimal PNG file structure
  const png = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    // IHDR chunk
    0x00, 0x00, 0x00, 0x0D, // length
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    (size >> 24) & 0xFF, (size >> 16) & 0xFF, (size >> 8) & 0xFF, size & 0xFF, // width
    (size >> 24) & 0xFF, (size >> 16) & 0xFF, (size >> 8) & 0xFF, size & 0xFF, // height
    0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x00, 0x00, 0x00, 0x00, // CRC placeholder
    // IDAT chunk (simplified - in reality would contain compressed image data)
    0x00, 0x00, 0x00, 0x0C, // length
    0x49, 0x44, 0x41, 0x54, // "IDAT"
    0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0xFF, 0x7F, 0x00, 0x09, 0xFB, 0x03, 0xFD, // simplified orange square
    0x00, 0x00, 0x00, 0x00, // CRC placeholder
    // IEND chunk
    0x00, 0x00, 0x00, 0x00, // length
    0x49, 0x45, 0x4E, 0x44, // "IEND"
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  const filename = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  // For now, create a proper PNG using a simpler approach
  // This creates a valid PNG but without the actual image data
  console.log(`Note: PNG generation requires additional libraries. Please use a tool to convert SVG to PNG.`);
});

// Generate shortcuts icons
const shortcutsDir = path.join(iconsDir, 'shortcuts');
if (!fs.existsSync(shortcutsDir)) {
  fs.mkdirSync(shortcutsDir, { recursive: true });
}

const shortcuts = ['restaurants', 'hotels', 'entertainment', 'card'];
shortcuts.forEach(name => {
  const svg = svgTemplate(96);
  const filename = path.join(shortcutsDir, `${name}-96x96.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Generated ${filename}`);
});

console.log('\n✅ Icon generation complete!');
console.log('Note: For production, convert SVG files to PNG using a tool like:');
console.log('  - ImageMagick: convert icon.svg icon.png');
console.log('  - Sharp (Node.js): npm install sharp');
console.log('  - Online tools: https://cloudconvert.com/svg-to-png');