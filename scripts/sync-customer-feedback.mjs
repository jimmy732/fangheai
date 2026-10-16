import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { qiniuStorageStatus, uploadQiniuObject } from '../qiniu-storage.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const folder = 'customer-feedback-20261017';
const directory = path.join(root, 'assets', folder);
const prefix = String(process.env.FBOX_QINIU_STATIC_PREFIX || 'fbox/static/assets').replace(/^\/+|\/+$/g, '');
if (!qiniuStorageStatus().configured) throw new Error('Customer feedback CDN upload requires the existing Qiniu configuration.');
const files = (await fs.readdir(directory)).filter(name => name.endsWith('.webp'));
if (files.length !== 108) throw new Error(`Expected 108 review images, got ${files.length}.`);
let cursor = 0;
let uploaded = 0;
async function worker() {
  while (cursor < files.length) {
    const name = files[cursor++];
    const bytes = await fs.readFile(path.join(directory, name));
    const result = await uploadQiniuObject({ key: `${prefix}/${folder}/${name}`, bytes, mime: 'image/webp' });
    if (!result.uploaded) throw new Error(`Upload failed for ${name}: ${result.reason}`);
    uploaded += 1;
  }
}
await Promise.all(Array.from({ length: 4 }, () => worker()));
console.log(`Uploaded ${uploaded} customer feedback images to the configured CDN.`);
