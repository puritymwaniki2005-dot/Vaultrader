import { cp, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outputDir = path.join(projectDir, 'react-platform', 'dist');
const excluded = new Set(['.git', '.github', '.vercel', 'node_modules', 'react-platform', 'dist', 'coverage']);

await mkdir(outputDir, { recursive: true });
for (const entry of await readdir(projectDir, { withFileTypes: true })) {
  if (excluded.has(entry.name)) continue;
  const source = path.join(projectDir, entry.name);
  const destination = path.join(outputDir, entry.name);
  if (entry.name === 'index.html') {
    await cp(source, path.join(outputDir, 'legacy-index.html'), { recursive: true, force: true });
    continue;
  }
  await cp(source, destination, { recursive: true, force: true });
}
console.log('Prepared production output: preserved legacy dashboard, bot, assets, and OAuth callback page.');
