/**
 * Ensure TypeDoc HTML exists under docs/public/api for dev/preview.
 * (VitePress copies only docs/public → dist; see docs/.vitepress/config.mts.)
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const marker = join(root, 'docs', 'public', 'api', 'index.html');

if (!existsSync(marker)) {
  console.info('Generating TypeDoc HTML for /api/ (first run or clean clone)…');
  execSync('npm run docs:api:html', { cwd: root, stdio: 'inherit' });
}
