import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distAssets = path.join(__dirname, 'dist', 'assets');
const backendAssets = path.join(__dirname, '..', 'backend', 'public', 'assets');

console.log('distAssets:', distAssets);
console.log('backendAssets:', backendAssets);

if (!fs.existsSync(distAssets)) {
  console.error('Папка dist/assets не найдена! Сначала выполните vite build.');
  process.exit(1);
}

// Рекурсивное копирование папки assets
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Удаляем старую папку assets, если есть
if (fs.existsSync(backendAssets)) {
  fs.rmSync(backendAssets, { recursive: true, force: true });
}

// Копируем новую папку assets
copyDir(distAssets, backendAssets);

console.log('Assets скопированы в backend/public/assets');