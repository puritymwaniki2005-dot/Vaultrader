# TradeNovaX React Platform Migration

## Goal
Move the TradeNovaX user-facing platform toward one responsive React application matching the supplied Mkorean reference: a compact account bar, horizontal module navigation, a coherent dashboard, and a Bot Builder that works on both mobile and desktop.

## Existing architecture findings
- The production landing page is the root `index.html`.
- The dashboard is a large standalone `dashboard.html` with inline CSS/JavaScript.
- The Bot Builder is a separate Deriv Bot app under `bot/`; `bot/index.html` embeds its own React build and injects DOM/CSS overrides to hide its inner navigation.
- `react-source/` already contains a React + TypeScript + Rsbuild Deriv Bot source tree using Blockly and Deriv packages. It is not yet the shared React shell for the whole site.
- `vercel.json` currently serves static files. Replacing the root entry point before a migration is validated would risk the live site.

## Migration strategy
1. Keep the current production entry points intact while building the replacement on a dedicated branch.
2. Establish a shared React shell and responsive design tokens for the top account bar, horizontal navigation, mobile navigation, and page content.
3. Map every existing module and its current entry point before replacing any route. Preserve the existing Deriv OAuth/session, WebSocket, Blockly workspace, saved strategies, proposal lifecycle, and REAL-purchase confirmation.
4. Integrate the Bot Builder without a competing duplicate header or destructive DOM mutation. Preserve the existing trading runtime rather than mocking trades or balances.
5. Add responsive tests and runtime checks, including navigation, authentication state, REAL/DEMO selection, mobile layout, and bot workspace initialization.
6. Build and preview the new application separately; only switch production after checks pass.

## Non-negotiable safeguards
- Do not show fabricated balances, P/L, win rates, or trades.
- Every REAL purchase must require explicit confirmation.
- Do not expose OAuth tokens or app secrets in the UI or source control.
- Do not delete or overwrite current production files as part of the initial scaffold.
- A successful commit/build is not proof of a correct live visual result.
