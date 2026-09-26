import fs from 'node:fs/promises';
import path from 'node:path';

const targetPaths = process.argv.slice(2);

if (!targetPaths.length) {
  throw new Error('Pass one or more fbox-store JSON files to update.');
}

function normalizedConstruction(product) {
  return String(product?.construction || '').trim().toLowerCase();
}

function forgedWheelUnitPrice(product) {
  if (String(product?.category || '').toLowerCase() !== 'wheels' || product?.public_scope === false) return null;

  const construction = normalizedConstruction(product);
  const premiumFamily = ['luxury', 'deep-lip', 'aero-disc'].includes(String(product?.design_family || '').toLowerCase());

  if (construction === 'two-piece') return premiumFamily ? 999 : 949;
  if (construction === 'three-piece') return premiumFamily ? 1299 : 1199;

  // Unconfirmed forged constructions still use the credible entry price without
  // being mislabeled as a one-, two- or three-piece wheel.
  if (construction === 'monoblock' || construction === 'unknown') return 649;
  return null;
}

for (const targetPath of targetPaths) {
  const resolvedPath = path.resolve(targetPath);
  if (path.extname(resolvedPath) === '.js') {
    let source = await fs.readFile(resolvedPath, 'utf8');
    const replacements = [
      [/price: 298/g, 'price: 649', 4],
      [/price: 290/g, 'price: 999', 1],
      [/price: 310/g, 'price: 649', 14]
    ];
    let changedCount = 0;
    for (const [pattern, replacement, expectedCount] of replacements) {
      const matches = source.match(pattern) || [];
      if (matches.length !== expectedCount) {
        throw new Error(`${resolvedPath}: expected ${expectedCount} matches for ${pattern}, found ${matches.length}.`);
      }
      source = source.replace(pattern, replacement);
      changedCount += matches.length;
    }
    await fs.writeFile(resolvedPath, source, 'utf8');
    console.log(JSON.stringify({ file: resolvedPath, changed_count: changedCount }, null, 2));
    continue;
  }

  const store = JSON.parse(await fs.readFile(resolvedPath, 'utf8'));
  if (!Array.isArray(store?.products)) throw new Error(`${resolvedPath} does not contain a products array.`);

  const changed = [];
  for (const product of store.products) {
    const nextPrice = forgedWheelUnitPrice(product);
    if (nextPrice === null || Number(product.price) === nextPrice) continue;
    changed.push({
      id: product.id,
      construction: normalizedConstruction(product),
      previous_price: Number(product.price || 0),
      price: nextPrice
    });
    product.price = nextPrice;
    product.currency = 'USD';
    product.price_mode = 'from';
    product.minimum_quantity = Math.max(4, Number(product.minimum_quantity || 0));
  }

  await fs.writeFile(resolvedPath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ file: resolvedPath, changed_count: changed.length, changed }, null, 2));
}
