import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { legacyStorefrontIds, taxonomyForProduct } from './cerui-product-taxonomy.mjs';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(moduleDir, '..');
const seedPath = path.join(projectDir, 'data', 'fbox-store.seed.json');

const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
let enriched = 0;
let hidden = 0;
seed.products = (Array.isArray(seed.products) ? seed.products : []).map(product => {
  const id = String(product?.id || '');
  if (legacyStorefrontIds.has(id)) {
    hidden += 1;
    return { ...product, public_scope: false, storefront_note: 'Archived from the custom forged wheel export catalog; retained for existing records.' };
  }
  const profile = taxonomyForProduct(id);
  if (!profile) return product;
  const { public_name, ...metadata } = profile;
  enriched += 1;
  return {
    ...product,
    ...metadata,
    name: public_name || product.name,
    catalog_display_name: public_name || product.name,
    meta: `${metadata.construction === 'two-piece' ? '2-piece' : metadata.construction === 'monoblock' ? 'Monoblock' : 'Custom construction'} forged wheel · Diameter / width / PCD / ET / CB built to order`,
    deal: 'Made to order · DDP quotation available for Europe and North America',
    updated_at: new Date().toISOString()
  };
});

await fs.writeFile(seedPath, `${JSON.stringify(seed, null, 2)}\n`, 'utf8');
process.stdout.write(`Enriched ${enriched} forged wheel products; hid ${hidden} legacy storefront records without deleting them.\n`);
