/**
 * CI / local smoke: prove Metro can produce an Android JS bundle (catches many
 * integration issues without a device). Output is written to a temp dir and removed.
 *
 * Run: npm run test:e2e:ci
 */

import { execSync } from 'child_process';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dir = mkdtempSync(join(tmpdir(), 'cents-e2e-export-'));

try {
  execSync(`npx expo export --platform android --output-dir "${dir}"`, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, CI: process.env.CI ?? 'true' },
  });
} finally {
  rmSync(dir, { recursive: true, force: true });
}
