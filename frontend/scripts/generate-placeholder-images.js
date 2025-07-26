const fs = require('fs');
const path = require('path');

// SVG template for placeholder images
function createPlaceholderSVG(width, height, text, color1 = '#ff6b6b', color2 = '#ee5a24') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#grad1)"/>
  <text x="${width/2}" y="${height/2}" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.1}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white">
    ${text}
  </text>
</svg>`;
}

// Images to generate
const images = [
  // Restaurant poster
  { path: 'public/images/restaurant-poster.svg', width: 800, height: 600, text: 'Restaurant Partners', color1: '#ff6b6b', color2: '#ee5a24' },
  
  // Partner logos
  { path: 'public/images/partners/hotel-1.svg', width: 200, height: 200, text: 'Hotel', color1: '#4834d4', color2: '#686de0' },
  { path: 'public/images/partners/restaurant-1.svg', width: 200, height: 200, text: 'Restaurant', color1: '#ff6b6b', color2: '#ee5a24' },
  { path: 'public/images/partners/spa-1.svg', width: 200, height: 200, text: 'Spa', color1: '#00d2d3', color2: '#54a0ff' },
  { path: 'public/images/partners/cinema-1.svg', width: 200, height: 200, text: 'Cinema', color1: '#f9ca24', color2: '#f0932b' },
  { path: 'public/images/partners/shopping-1.svg', width: 200, height: 200, text: 'Shopping', color1: '#a29bfe', color2: '#6c5ce7' },
  { path: 'public/images/partners/fitness-1.svg', width: 200, height: 200, text: 'Fitness', color1: '#55a3ff', color2: '#2e86de' },
  
  // Generic partner placeholder
  { path: 'public/images/partner-placeholder.svg', width: 200, height: 200, text: 'Partner', color1: '#dfe6e9', color2: '#b2bec3' },
];

// Generate images
images.forEach(({ path: filePath, width, height, text, color1, color2 }) => {
  const dir = path.dirname(filePath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Generate SVG content
  const svg = createPlaceholderSVG(width, height, text, color1, color2);
  
  // Write file
  fs.writeFileSync(filePath, svg);
  console.log(`Generated: ${filePath}`);
});

console.log('All placeholder images generated successfully!');