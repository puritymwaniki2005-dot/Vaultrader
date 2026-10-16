import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const htmlPath = path.join(root, 'dashboard.html');
const html = readFileSync(htmlPath, 'utf8');

assert.equal((html.match(/<script id="tnx-reference-bot-engine-v2">/g) || []).length, 1,
  'Exactly one consolidated reference Blockly runtime must exist.');
assert.equal((html.match(/<\/body>/gi) || []).length, 1,
  'Dashboard must contain a single closing body tag.');
assert.equal((html.match(/<\/html>/gi) || []).length, 1,
  'Dashboard must contain a single closing html tag.');
assert.ok(html.endsWith('</body>\n</html>') || html.trimEnd().endsWith('</body>\n</html>'),
  'Runtime/style patches must remain inside the actual document.');

const runnerStart = html.indexOf('<script id="tnx-reference-bot-engine-v2">');
const runner = html.slice(runnerStart);
for (const required of [
  "kind:'tnxReferenceProposal'",
  "kind:'tnxReferenceBuy'",
  'window.TNX_CORE_HANDLERS?.handleContract',
  'd?.error',
  'proposal_open_contract:1',
  'R.sessionPnl+=pnl',
  'window.tnxBuilderStop=()=>stop',
]) {
  assert.ok(runner.includes(required), 'Consolidated runtime missing required flow: ' + required);
}

const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'vaultrader-dashboard-check-'));
try {
  const inlineScriptPattern = /<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script\s*>/gi;
  let match;
  let count = 0;
  while ((match = inlineScriptPattern.exec(html))) {
    const source = match[1];
    if (!source.trim()) continue;
    const file = path.join(tempRoot, 'inline-' + (++count) + '.js');
    writeFileSync(file, source);
    const check = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    assert.equal(check.status, 0,
      'Inline dashboard script #' + count + ' has a syntax error:\n' + (check.stderr || check.stdout));
  }
  assert.ok(count > 10, 'Expected to syntax-check the dashboard inline JavaScript.');
  console.log('Vaultrader dashboard checks passed; syntax-checked ' + count + ' inline scripts.');
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
