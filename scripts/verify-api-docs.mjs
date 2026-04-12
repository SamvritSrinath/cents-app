/**
 * Regenerates TypeDoc markdown and fails if docs/generated/api-md drifts from HEAD
 * or contains untracked files (e.g. new pages not yet committed).
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

execSync('npm run docs:api', { cwd: root, stdio: 'inherit' });
execSync('git diff HEAD --exit-code -- docs/generated/api-md', {
  cwd: root,
  stdio: 'inherit',
});

const porcelain = execSync('git status --porcelain -- docs/generated/api-md', {
  cwd: root,
  encoding: 'utf8',
}).trim();

const untracked = porcelain
  .split('\n')
  .filter(Boolean)
  .filter((line) => line.startsWith('??'));
if (untracked.length) {
  console.error(
    'Untracked files under docs/generated/api-md (add and commit them):\n' +
      untracked.join('\n')
  );
  process.exit(1);
}
