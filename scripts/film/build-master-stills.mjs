import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('public/film/stills');
fs.mkdirSync(outDir, { recursive: true });

async function createS03Extraction() {
  console.log('Generating S03 extraction stills...');
  const width = 2400, height = 1350;

  // 1. Create dark earth base with radial warm key light at x=0.68, y=0.55
  const baseSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="keyLight" cx="66%" cy="52%" r="55%" fx="58%" fy="42%">
          <stop offset="0%" stop-color="#422a18" stop-opacity="1" />
          <stop offset="35%" stop-color="#2a1a0f" stop-opacity="0.9" />
          <stop offset="70%" stop-color="#140f0a" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#080604" stop-opacity="1" />
        </radialGradient>
        <radialGradient id="amberPool" cx="68%" cy="66%" r="28%">
          <stop offset="0%" stop-color="#d98218" stop-opacity="0.85" />
          <stop offset="45%" stop-color="#94520a" stop-opacity="0.6" />
          <stop offset="80%" stop-color="#4a2504" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="vignette" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.3" />
          <stop offset="50%" stop-color="#000000" stop-opacity="0" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.55" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#keyLight)" />
      <circle cx="${width * 0.68}" cy="${height * 0.66}" r="${width * 0.28}" fill="url(#amberPool)" />
      <rect width="${width}" height="${height}" fill="url(#vignette)" />
    </svg>
  `);

  // Prepare ginger engraving overlay from Zingiber plate
  const gingerRaw = await sharp('public/plates/zingiber-officinale-2048.webp')
    .resize(1100, 1100, { fit: 'inside' })
    .toBuffer();

  const gingerCut = await sharp(gingerRaw)
    .modulate({ brightness: 1.15, saturation: 1.2 })
    .tint({ r: 218, g: 154, b: 72 }) // Warm amber gold tint
    .toBuffer();

  const comp = await sharp(baseSvg)
    .composite([
      {
        input: gingerCut,
        left: Math.round(width * 0.52),
        top: Math.round(height * 0.12),
        blend: 'screen',
      },
    ])
    .webp({ quality: 84 })
    .toFile(path.join(outDir, 's03-extraction-d.webp'));

  // Mobile portrait (900x1600)
  await sharp(path.join(outDir, 's03-extraction-d.webp'))
    .resize(900, 1600, { fit: 'cover', position: 'right' })
    .webp({ quality: 80 })
    .toFile(path.join(outDir, 's03-extraction-m.webp'));

  console.log('Built s03-extraction-d.webp and s03-extraction-m.webp');
}

async function createS04Uruli() {
  console.log('Generating S04 uruli compounding stills...');
  const width = 2400, height = 1350;

  // Use the authentic factory vessel photo as the heart of the Uruli scene
  const vesselBuf = await sharp('public/content/gallery/factory-2.webp')
    .resize(1600, 1350, { fit: 'cover', position: 'top' })
    .modulate({ brightness: 0.88, saturation: 1.15 })
    .tint({ r: 210, g: 145, b: 65 }) // Warm bronze & amber tone
    .toBuffer();

  const overlaySvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="causticGlow" cx="64%" cy="56%" r="40%">
          <stop offset="0%" stop-color="#ffb833" stop-opacity="0.45" />
          <stop offset="40%" stop-color="#cc7700" stop-opacity="0.25" />
          <stop offset="80%" stop-color="#4a2200" stop-opacity="0.1" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="scrimLeft" x1="0%" y1="0%" x2="50%" y2="0%">
          <stop offset="0%" stop-color="#0a0705" stop-opacity="0.95" />
          <stop offset="60%" stop-color="#0a0705" stop-opacity="0.7" />
          <stop offset="100%" stop-color="#0a0705" stop-opacity="0" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#causticGlow)" />
      <rect width="${width}" height="${height}" fill="url(#scrimLeft)" />
    </svg>
  `);

  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 10, g: 7, b: 5 },
    },
  })
    .composite([
      { input: vesselBuf, left: width - 1600, top: 0, blend: 'over' },
      { input: overlaySvg, left: 0, top: 0, blend: 'over' },
    ])
    .webp({ quality: 84 })
    .toFile(path.join(outDir, 's04-uruli-d.webp'));

  await sharp(path.join(outDir, 's04-uruli-d.webp'))
    .resize(900, 1600, { fit: 'cover', position: 'right' })
    .webp({ quality: 80 })
    .toFile(path.join(outDir, 's04-uruli-m.webp'));

  console.log('Built s04-uruli-d.webp and s04-uruli-m.webp');
}

async function createS05Products() {
  console.log('Generating S05 products reveal stills...');
  const width = 2400, height = 1350;

  // Background: Deep botanical dark forest
  const bgForest = await sharp('public/film/stills/s01-shola-2-d.webp')
    .resize(width, height, { fit: 'cover' })
    .modulate({ brightness: 0.38, saturation: 0.6 })
    .blur(18) // Cinematic background bokeh
    .toBuffer();

  // Bottle 1: Rujanth Liniment (Hero center-right, high res)
  const rujanth = await sharp('public/content/gallery/rujanth-1.webp')
    .resize(700, 1050, { fit: 'inside' })
    .toBuffer();

  // Bottle 2: Mezhu Thailam (Left flank)
  const mezhu = await sharp('public/content/blog/avvvs-mezhu-thailam-the-sure-shot-remedy-for-aches-and-pains.webp')
    .resize(550, 550, { fit: 'inside' })
    .toBuffer();

  // Bottle 3: Red Irons / Lakshol (Right flank)
  const redIrons = await sharp('public/content/gallery/red-irons.webp')
    .resize(560, 840, { fit: 'inside' })
    .toBuffer();

  // Lighting overlay: Teak pedestal + upper-left key light + golden rim light glow
  const lightSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="goldRim" cx="72%" cy="58%" r="45%">
          <stop offset="0%" stop-color="#ffd566" stop-opacity="0.32" />
          <stop offset="35%" stop-color="#c99726" stop-opacity="0.18" />
          <stop offset="70%" stop-color="#7a5510" stop-opacity="0.05" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="teakPedestal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#24140a" stop-opacity="0.9" />
          <stop offset="25%" stop-color="#190e06" stop-opacity="0.98" />
          <stop offset="100%" stop-color="#080402" stop-opacity="1" />
        </linearGradient>
        <linearGradient id="copyZoneScrim" x1="0%" y1="0%" x2="52%" y2="0%">
          <stop offset="0%" stop-color="#050a06" stop-opacity="0.92" />
          <stop offset="55%" stop-color="#050a06" stop-opacity="0.75" />
          <stop offset="100%" stop-color="#050a06" stop-opacity="0" />
        </linearGradient>
      </defs>
      <!-- Teak surface at the bottom third -->
      <rect y="${Math.round(height * 0.72)}" width="${width}" height="${Math.round(height * 0.28)}" fill="url(#teakPedestal)" />
      <!-- Atmospheric gold rim / key light -->
      <rect width="${width}" height="${height}" fill="url(#goldRim)" />
      <!-- Left copy zone calm scrim -->
      <rect width="${width}" height="${height}" fill="url(#copyZoneScrim)" />
    </svg>
  `);

  await sharp(bgForest)
    .composite([
      // Teak and lighting base
      { input: lightSvg, left: 0, top: 0, blend: 'over' },
      // Mezhu Thailam bottle (left)
      { input: mezhu, left: Math.round(width * 0.50), top: Math.round(height * 0.42), blend: 'over' },
      // Red Irons bottle (right)
      { input: redIrons, left: Math.round(width * 0.74), top: Math.round(height * 0.28), blend: 'over' },
      // Rujanth Liniment hero bottle (center-front)
      { input: rujanth, left: Math.round(width * 0.60), top: Math.round(height * 0.20), blend: 'over' },
    ])
    .webp({ quality: 86 })
    .toFile(path.join(outDir, 's05-products-d.webp'));

  await sharp(path.join(outDir, 's05-products-d.webp'))
    .resize(900, 1600, { fit: 'cover', position: 'right' })
    .webp({ quality: 82 })
    .toFile(path.join(outDir, 's05-products-m.webp'));

  console.log('Built s05-products-d.webp and s05-products-m.webp');
}

async function main() {
  await createS03Extraction();
  await createS04Uruli();
  await createS05Products();
  console.log('All master stills created successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

