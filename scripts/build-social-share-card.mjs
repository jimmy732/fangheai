import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const suppliedBackground = process.argv[2];
const backgroundPath = suppliedBackground
  ? path.resolve(suppliedBackground)
  : path.join(projectRoot, 'assets', 'cerui', 'forcarbox-social-share-background-v1.webp');
const normalizedBackgroundPath = path.join(projectRoot, 'assets', 'cerui', 'forcarbox-social-share-background-v1.webp');
const outputPath = path.join(projectRoot, 'assets', 'cerui', 'forcarbox-social-share-v1.jpg');
const markPath = path.join(projectRoot, 'assets', 'cerui', 'cerui-mark-black-v1.webp');

const width = 1200;
const height = 630;

if (suppliedBackground) {
  await sharp(backgroundPath)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .webp({ quality: 88, effort: 5 })
    .toFile(normalizedBackgroundPath);
}

const brandMark = await sharp(markPath)
  .resize(68, 68, { fit: 'contain' })
  .ensureAlpha()
  .negate({ alpha: false })
  .png()
  .toBuffer();

const overlay = Buffer.from(`
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="copyShade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#050607" stop-opacity="0.98"/>
        <stop offset="0.43" stop-color="#050607" stop-opacity="0.88"/>
        <stop offset="0.62" stop-color="#050607" stop-opacity="0.22"/>
        <stop offset="0.78" stop-color="#050607" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="bottomShade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.55" stop-color="#050607" stop-opacity="0"/>
        <stop offset="1" stop-color="#050607" stop-opacity="0.72"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#copyShade)"/>
    <rect width="${width}" height="${height}" fill="url(#bottomShade)"/>
    <rect x="67" y="164" width="5" height="159" fill="#eb0a46"/>
    <text x="154" y="91" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="800" letter-spacing="2.6">CIRUI FORGED</text>
    <text x="154" y="116" fill="#aab0b7" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="2">SOURCE FACTORY · GLOBAL CUSTOM PROGRAM</text>
    <text x="94" y="210" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="60" font-weight="900" letter-spacing="-1">CUSTOM FORGED</text>
    <text x="94" y="278" fill="#eb0a46" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="900" letter-spacing="-1.5">WHEELS.</text>
    <text x="94" y="349" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700">One-piece · Two-piece · Three-piece</text>
    <text x="94" y="386" fill="#c9cdd2" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="500">Production → delivery within 30 business days</text>
    <rect x="94" y="429" width="355" height="52" rx="3" fill="#eb0a46"/>
    <text x="118" y="462" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="800" letter-spacing="0.8">FREE WHEEL FITMENT CALCULATOR</text>
    <text x="94" y="558" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="800">forcarbox.cn</text>
    <text x="94" y="586" fill="#9198a1" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="600" letter-spacing="0.8">OFFICIAL OVERSEAS WEBSITE OF CIRUI FORGED</text>
  </svg>
`);

await sharp(normalizedBackgroundPath)
  .resize(width, height, { fit: 'cover', position: 'center' })
  .composite([
    { input: overlay, left: 0, top: 0 },
    { input: brandMark, left: 73, top: 57 }
  ])
  .flatten({ background: '#050607' })
  .jpeg({ quality: 91, chromaSubsampling: '4:4:4', progressive: true })
  .toFile(outputPath);

const metadata = await sharp(outputPath).metadata();
console.log(`${outputPath} ${metadata.width}x${metadata.height} ${metadata.format}`);
