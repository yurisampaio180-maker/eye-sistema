/**
 * Gera todos os PNG de favicon a partir do PNG oficial da logo.
 *
 * Uso:
 *   1. Copie eye-logo-oficial.png para src/assets/brand/eye-logo-mark.png
 *   2. node scripts/gen-favicons.mjs
 *
 * Saída em public/:
 *   favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png (180×180),
 *   android-chrome-192x192.png, android-chrome-512x512.png, og-image.png (1200×630)
 */
import Jimp from 'jimp';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');

const candidatos = [
  join(root, 'src', 'assets', 'brand', 'eye-logo-mark.png'),
  join(root, 'public', 'eye-logo-mark.png'),
  join(root, 'eye-logo-oficial.png'),
];

const src = candidatos.find(existsSync);
if (!src) {
  console.error('Erro: PNG da logo não encontrado. Copie eye-logo-oficial.png para src/assets/brand/eye-logo-mark.png');
  process.exit(1);
}
console.log(`Usando: ${src}`);

const img = await Jimp.read(src);

const icones = [
  { file: 'favicon-16x16.png',          size: 16  },
  { file: 'favicon-32x32.png',          size: 32  },
  { file: 'apple-touch-icon.png',        size: 180 },
  { file: 'android-chrome-192x192.png',  size: 192 },
  { file: 'android-chrome-512x512.png',  size: 512 },
];

for (const { file, size } of icones) {
  const out = join(root, 'public', file);
  await img.clone().resize(size, size).writeAsync(out);
  console.log(`✓ public/${file}`);
}

// OG image: logo centralizada em fundo escuro 1200×630
const ogW = 1200, ogH = 630;
const logoSize = 420;
const bg = new Jimp(ogW, ogH, 0x0A0A0AFF);
const logo = await img.clone().resize(logoSize, logoSize);
bg.composite(logo, (ogW - logoSize) / 2, (ogH - logoSize) / 2);
const ogOut = join(root, 'public', 'og-image.png');
await bg.writeAsync(ogOut);
console.log('✓ public/og-image.png');

console.log('\nTodos os ícones gerados. Commit a pasta public/ inteira.');
