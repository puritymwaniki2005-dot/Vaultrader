import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';

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
  'waiting for a NEW live tick',
  'R.sellRequestedFor!==id',
  'proposal_open_contract:1,contract_id:String(contractId)',
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

  // Exercise the real consolidated Blockly runner with a mocked authenticated
  // demo WebSocket. No Deriv credentials or live orders are used in this test.
  const scriptEnd = runner.indexOf('</script>');
  assert.ok(scriptEnd > 0, 'Consolidated runner script must close cleanly.');
  const runtimeSource = runner.slice(runner.indexOf('>') + 1, scriptEnd);
  const calls = [];
  const statusNode = { textContent: '' };
  const blocks = [
    { type: 'tnx_trade_parameters', getFieldValue: (name) => ({
      SYMBOL: 'R_10', DURATION: '1', STAKE: '0.35'
    })[name] },
    { type: 'tnx_purchase', getFieldValue: (name) => ({
      CONTRACT: 'DIGITEVEN', PREDICTION: '5'
    })[name] },
    { type: 'tnx_sell_conditions', getFieldValue: (name) => ({
      TARGET: '0.20'
    })[name] },
  ];
  let reqId = 100;
  const mockWindow = {
    TNX_BLOCKLY_RUNNER: {},
    TNX_BLOCKLY_WORKSPACE: { getAllBlocks: () => blocks },
    activeAccount: { account_type: 'demo', account_id: 'VRTC123', currency: 'USD' },
    liveConnected: true,
    derivWS: { readyState: 1 },
    pending: new Map(),
    activeContracts: new Map(),
    lastTick: { epoch: 100, digit: 4, quote: 123.4 },
    send: (payload) => { const id = ++reqId; calls.push({ id, payload }); return id; },
    subscribeTicks: () => {},
    tnxCanOpenTrade: () => true,
    confirmRealTrade: () => true,
    showToast: () => {},
    TNX_CORE_HANDLERS: {
      handleContract: (contract) => {
        mockWindow.activeContracts.set(String(contract.contract_id), contract);
      },
    },
    handleProposal: () => {},
    handleBuy: () => {},
    handleContract: () => {},
    onTick: () => {},
  };
  const mockDocument = { getElementById: (id) => id === 'builderRunStatus' ? statusNode : null };
  runInNewContext(runtimeSource, {
    window: mockWindow, document: mockDocument,
    WebSocket: { OPEN: 1 }, setTimeout, clearTimeout, console,
  });

  await mockWindow.tnxBuilderRun();
  const proposalCall = calls.find((call) => call.payload.proposal === 1);
  assert.ok(proposalCall, 'Starting the Blockly bot must request a Deriv proposal.');
  assert.equal(mockWindow.TNX_BLOCKLY_RUNNER.pending, true, 'Proposal request must set the pending guard.');
  mockWindow.handleProposal({
    req_id: proposalCall.id,
    proposal: { id: 'proposal-demo-1', ask_price: 0.35 },
  });
  const buyCall = calls.find((call) => call.payload.buy === 'proposal-demo-1');
  assert.ok(buyCall, 'Accepted proposal must be followed by a purchase request.');
  mockWindow.handleBuy({ req_id: buyCall.id, buy: { contract_id: 123456, buy_price: 0.35 } });
  assert.ok(calls.some((call) => call.payload.proposal_open_contract === 1 &&
    String(call.payload.contract_id) === '123456'),
    'Confirmed buy must start contract monitoring.');
  assert.equal(mockWindow.TNX_BLOCKLY_RUNNER.runs, 1, 'Run count must increment only after a contract ID exists.');
  mockWindow.handleContract({
    contract_id: 123456, is_sold: false, status: 'open', profit: 0.25, bid_price: 0.60,
  });
  const sellCall = calls.find((call) => call.payload.sell === '123456');
  assert.ok(sellCall, 'Configured sell target must issue a sell request once its threshold is met.');
  assert.equal(sellCall.payload.price, 0.60, 'Sell request must use the latest bid price.');
  mockWindow.handleContract({
    contract_id: 123456, is_sold: true, status: 'sold', profit: 0.35, buy_price: 0.35,
  });
  assert.equal(mockWindow.TNX_BLOCKLY_RUNNER.running, false,
    'Single-run bot must stop after its contract closes.');
  assert.equal(mockWindow.TNX_BLOCKLY_RUNNER.sessionPnl, 0.35,
    'Closed contract profit must be reflected in session P/L.');
  assert.match(statusNode.textContent, /maximum runs reached/,
    'UI status must reflect the completed run.');

  // Verify a rejected proposal fails closed without sending a buy.
  mockWindow.lastTick = { epoch: 101, digit: 4, quote: 123.5 };
  await mockWindow.tnxBuilderRun();
  const rejectedProposal = calls.filter((call) => call.payload.proposal === 1).at(-1);
  assert.ok(rejectedProposal, 'A new test run should request another proposal.');
  const buyCountBeforeReject = calls.filter((call) => Object.hasOwn(call.payload, 'buy')).length;
  mockWindow.handleProposal({ req_id: rejectedProposal.id, error: { message: 'proposal rejected in test' } });
  assert.equal(mockWindow.TNX_BLOCKLY_RUNNER.running, false,
    'A rejected proposal must stop the runner rather than hanging.');
  assert.equal(calls.filter((call) => Object.hasOwn(call.payload, 'buy')).length, buyCountBeforeReject,
    'A rejected proposal must never trigger a buy.');
  assert.match(statusNode.textContent, /proposal rejected in test/,
    'Proposal rejection must be visible to the user.');

  console.log('Vaultrader dashboard checks passed; syntax-checked ' + count +
    ' inline scripts and simulated proposal → buy → contract close + rejection.');
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
