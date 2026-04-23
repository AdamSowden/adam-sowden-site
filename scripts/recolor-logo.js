// Recolor a single-colour logo on a white or transparent background.
//
// Strategy: treat the original ink as an opacity mask. Darker pixels become
// more-opaque target-colour pixels; white/transparent pixels become fully
// transparent. Anti-aliased edges survive intact because they are already
// mid-grey (mid-navy) in the source, which maps to mid-alpha in the output.
//
// Usage: node scripts/recolor-logo.js <input> <output> <#hex>

const sharp = require("sharp");
const path = require("path");

async function recolor(inputPath, outputPath, hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const origR = data[i];
    const origG = data[i + 1];
    const origB = data[i + 2];
    const origA = data[i + 3];

    // Ink density: 0 = pure white (no ink), 1 = pure black/navy (full ink).
    // Luminance formula weights green more, matching perceived brightness.
    const luminance =
      (0.299 * origR + 0.587 * origG + 0.114 * origB) / 255;
    const inkDensity = 1 - luminance;

    // Combine original alpha with ink density. A fully transparent source
    // pixel stays transparent. A white-background pixel becomes transparent.
    // A navy pixel becomes fully opaque target colour.
    const outA = Math.round(origA * inkDensity);

    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
    out[i + 3] = outA;
  }

  const ext = path.extname(outputPath).toLowerCase();
  let pipeline = sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
  if (ext === ".webp") pipeline = pipeline.webp({ lossless: true });
  else pipeline = pipeline.png();

  await pipeline.toFile(outputPath);
  console.log(`✓ ${inputPath} -> ${outputPath} (${hex})`);
}

async function main() {
  const [, , input, output, hex] = process.argv;
  if (!input || !output || !hex) {
    console.error(
      "Usage: node scripts/recolor-logo.js <input> <output> <#hex>"
    );
    process.exit(1);
  }
  await recolor(input, output, hex);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
