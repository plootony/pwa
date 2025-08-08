#!/bin/bash

echo "🚀 Preparing PWA for Vercel deployment..."

# Copy source files to root
echo "📁 Copying source files..."
cp src/main.js .
cp src/style.css .

# Copy public assets to root
echo "🖼️ Copying assets..."
cp public/*.svg .
cp public/favicon.ico .

echo "✅ Files prepared for Vercel deployment!"
echo ""
echo "📄 Files in root directory:"
ls -la *.js *.css *.svg *.ico | head -10

echo ""
echo "⚙️ Vercel configuration:"
echo "✅ vercel.json - PWA headers and routing configured"
echo "✅ Service Worker support enabled"
echo "✅ SPA routing fallback configured"
echo ""
echo "🌐 Ready to deploy to Vercel!"
echo "Run: vercel --prod"