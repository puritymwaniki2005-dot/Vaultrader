import { cp, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outputDir = path.join(projectDir, 'react-platform', 'dist');
const excluded = new Set(['.git', '.github', '.vercel', 'node_modules', 'react-platform', 'dist', 'coverage']);

await mkdir(outputDir, { recursive: true });
for (const entry of await readdir(projectDir, { withFileTypes: true })) {
  if (excluded.has(entry.name) || entry.name === 'index.html' || entry.name === 'legacy-index.html') continue;
  const source = path.join(projectDir, entry.name);
  const destination = path.join(outputDir, entry.name);
  await cp(source, destination, { recursive: true, force: true });
}
// Publish one canonical homepage: the root index.html landing page. Keep the legacy page only
// for handling Deriv OAuth callbacks; its guard redirects ordinary visits back to the homepage.
await cp(path.join(projectDir, 'index.html'), path.join(outputDir, 'index.html'), { force: true });
await cp(path.join(projectDir, 'legacy-index.html'), path.join(outputDir, 'legacy-index.html'), { force: true });
console.log('Prepared production output: single canonical landing page plus OAuth callback handler, dashboard, bot, and assets.');
