/**
 * Skrypt post-export: kopiuje fonty z głębokiej ścieżki node_modules
 * do płaskiego folderu /fonts/ w dist, aby Netlify mógł je serwować.
 */
const fs = require('fs');
const path = require('path');

const FONT_SOURCE = path.join(__dirname, 'dist', 'assets', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');
const FONT_DEST = path.join(__dirname, 'dist', 'fonts');

if (!fs.existsSync(FONT_SOURCE)) {
  console.log('⚠️  Brak folderu fontów w dist — pomiń kopiowanie.');
  process.exit(0);
}

if (!fs.existsSync(FONT_DEST)) {
  fs.mkdirSync(FONT_DEST, { recursive: true });
}

const files = fs.readdirSync(FONT_SOURCE).filter(f => f.endsWith('.ttf'));
files.forEach(file => {
  fs.copyFileSync(path.join(FONT_SOURCE, file), path.join(FONT_DEST, file));
});

console.log(`✅ Skopiowano ${files.length} fontów do dist/fonts/`);
