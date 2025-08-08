// Simple icon generator for PWA
// This creates basic PNG icons using canvas in Node.js

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const createSVGIcon = (size) => {
    return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
        </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.1}" ry="${size * 0.1}" fill="url(#grad)"/>
    
    <!-- Newspaper icon -->
    <rect x="${size * 0.2}" y="${size * 0.2}" width="${size * 0.6}" height="${size * 0.6}" fill="white" rx="${size * 0.02}"/>
    
    <!-- Header -->
    <rect x="${size * 0.25}" y="${size * 0.25}" width="${size * 0.5}" height="${size * 0.1}" fill="#2563eb"/>
    
    <!-- Text lines -->
    <rect x="${size * 0.25}" y="${size * 0.42}" width="${size * 0.22}" height="${size * 0.03}" fill="#64748b"/>
    <rect x="${size * 0.53}" y="${size * 0.42}" width="${size * 0.22}" height="${size * 0.03}" fill="#64748b"/>
    
    <rect x="${size * 0.25}" y="${size * 0.48}" width="${size * 0.22}" height="${size * 0.03}" fill="#64748b"/>
    <rect x="${size * 0.53}" y="${size * 0.48}" width="${size * 0.22}" height="${size * 0.03}" fill="#64748b"/>
    
    <rect x="${size * 0.25}" y="${size * 0.54}" width="${size * 0.22}" height="${size * 0.03}" fill="#64748b"/>
    <rect x="${size * 0.53}" y="${size * 0.54}" width="${size * 0.22}" height="${size * 0.03}" fill="#64748b"/>
    
    <rect x="${size * 0.25}" y="${size * 0.60}" width="${size * 0.22}" height="${size * 0.03}" fill="#64748b"/>
    <rect x="${size * 0.53}" y="${size * 0.60}" width="${size * 0.22}" height="${size * 0.03}" fill="#64748b"/>
    
    <rect x="${size * 0.25}" y="${size * 0.66}" width="${size * 0.22}" height="${size * 0.03}" fill="#64748b"/>
    <rect x="${size * 0.53}" y="${size * 0.66}" width="${size * 0.22}" height="${size * 0.03}" fill="#64748b"/>
</svg>`.trim();
};

// Create icons directory
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// Generate SVG icons for different sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
    const svgContent = createSVGIcon(size);
    const filename = `icon-${size}x${size}.svg`;
    fs.writeFileSync(path.join(publicDir, filename), svgContent);
    console.log(`Generated ${filename}`);
});

// Create a simple favicon
const faviconSVG = `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" fill="#2563eb"/>
    <rect x="4" y="4" width="24" height="24" fill="white" rx="1"/>
    <rect x="6" y="6" width="20" height="4" fill="#2563eb"/>
    <rect x="6" y="12" width="8" height="2" fill="#64748b"/>
    <rect x="16" y="12" width="8" height="2" fill="#64748b"/>
    <rect x="6" y="16" width="8" height="2" fill="#64748b"/>
    <rect x="16" y="16" width="8" height="2" fill="#64748b"/>
    <rect x="6" y="20" width="8" height="2" fill="#64748b"/>
    <rect x="16" y="20" width="8" height="2" fill="#64748b"/>
</svg>`.trim();

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSVG);
console.log('Generated favicon.svg');

console.log('All icons generated successfully!');
console.log('Note: For production, consider converting SVG icons to PNG for better browser compatibility.');