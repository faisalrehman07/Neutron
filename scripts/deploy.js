import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

console.log('[Deploy] Building project...');
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

// Add .nojekyll and 404.html
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));

// Always wipe existing .git in dist to ensure fresh clean root commit
try {
  fs.rmSync(path.join(distDir, '.git'), { recursive: true, force: true });
} catch {}

console.log('[Deploy] Publishing dist directory to gh-pages branch...');
const gitCommands = [
  'git init',
  'git checkout -B gh-pages',
  'git add -A',
  'git commit -m "deploy: update GitHub Pages build"',
  'git remote add origin https://github.com/faisalrehman07/Neutron.git',
  'git push -f origin gh-pages'
];

for (const cmd of gitCommands) {
  try {
    execSync(cmd, { cwd: distDir, stdio: 'inherit' });
  } catch (e) {
    // If remote already exists or other non-fatal error
    if (!cmd.includes('git remote add')) {
      throw e;
    }
  }
}

// Cleanup local .git inside dist
try {
  fs.rmSync(path.join(distDir, '.git'), { recursive: true, force: true });
} catch {}

console.log('[Deploy] Successfully deployed to gh-pages branch!');
console.log('[Deploy] Live URL: https://faisalrehman07.github.io/Neutron/');
