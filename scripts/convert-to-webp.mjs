import sharp from 'sharp';
import { join, dirname } from 'path';
import { statSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function convertPngToWebp() {
  const inputPath = join(projectRoot, 'public/covers/fracture-engine.png');
  const outputPath1 = join(projectRoot, 'public/covers/fracture-engine.webp');
  const outputPath2 = join(projectRoot, 'src/assets/covers/fracture-engine.webp');

  try {
    // Convert and save to public
    await sharp(inputPath)
      .webp({ quality: 90, effort: 6 })
      .toFile(outputPath1);

    console.log('✓ Created public/covers/fracture-engine.webp');

    // Convert and save to src/assets
    await sharp(inputPath)
      .webp({ quality: 90, effort: 6 })
      .toFile(outputPath2);

    console.log('✓ Created src/assets/covers/fracture-engine.webp');

    // Get file sizes for comparison
    const originalSize = statSync(inputPath).size;
    const newSize = statSync(outputPath1).size;
    const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

    console.log(`\nOriginal PNG: ${(originalSize / 1024).toFixed(0)}KB`);
    console.log(`WebP: ${(newSize / 1024).toFixed(0)}KB`);
    console.log(`Savings: ${savings}%`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

convertPngToWebp();
