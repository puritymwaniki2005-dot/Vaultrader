import { useState } from 'react';
import { Activity, Bot, ChartNoAxesCombined, ChevronDown, Crown, Hand, LayoutDashboard, LogOut, Menu, Search, ShieldCheck, Sparkles, Wallet, X, Zap } from 'lucide-react';

const modules = [
  ['Dashboard', LayoutDashboard, '/dashboard.html'],
  ['Bot Builder', Bot, '/bot/'],
  ['Manual Trader', Hand, '/dashboard.html#manual-trader'],
  ['Bulk Trader', Activity, '/dashboard.html#bulk-trader'],
  ['Live Positions', ChartNoAxesCombined, '/dashboard.html#positions'],
  ['Free Bots', Bot, '/dashboard.html#free-bots'],
  ['Premium AI Bots', Crown, '/dashboard.html#premium-bots'],
  ['Smart AI', Sparkles, '/dashboard.html#smart-ai'],
  ['Quick Bot', Zap, '/dashboard.html#quick-bot'],
  ['Analysis Tools', Search, '/dashboard.html#analysis'],
  ['Hedging', ShieldCheck, '/dashboard.html#hedging'],
] as const;

function AccountMenu({ close }: { close: () => void }) {
  return <div className="account-popover" role="dialog" aria-label="Account menu">
    <div className="account-tabs"><strong>Account controls</strong><button onClick={close} aria-label="Close"><X size={17}/></button></div>
    <div className="account-info"><span className="account-icon"><Wallet size={20}/></span><div><strong>Deriv account</strong><p>Use the existing authenticated session to select REAL or DEMO and view your live balance.</p></div></div>
    <a href="/dashboard.html#account"><ShieldCheck size={18}/> Account settings</a>
    <a href="/dashboard.html#logout"><LogOut size={18}/> Logout <span>Open account controls</span></a>
    <p className="account-note">This preview does not fabricate balances or change account state.</p>
  </div>;
}
function Metric({ icon: Icon, title, detail }: { icon: typeof Wallet; title: string; detail: string }) {
  return <article className="metric"><span className="metric-icon"><Icon size={22}/></span><div><h3>{title}</h3><strong>—</strong><p>{detail}</p></div></article>;
}
function ModuleCard({ icon: Icon, title, text, href }: { icon: typeof Bot; title: string; text: string; href: string }) {
  return <a className="module-card" href={href}><span className="module-icon"><Icon size={21}/></span><h3>{title}</h3><p>{text}</p><span className="module-link">Open module →</span></a>;
}
export default function App() {
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [active, setActive] = useState('Dashboard');
  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="/"><span className="brand-mark">TN</span><span>TradeNova<span className="brand-x">X</span></span></a>
      <div className="topbar-right"><span className="market-tag"><i className="live-dot"/> Deriv trading workspace</span><button className="account-button" onClick={() => setAccountOpen(v => !v)} aria-expanded={accountOpen}><span className="account-logo">D</span><span className="account-button-text"><strong>Deriv Account</strong><small>Account controls</small></span><ChevronDown size={18}/></button></div>
      {accountOpen && <AccountMenu close={() => setAccountOpen(false)}/>}
    </header>
    <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(v => !v)} aria-expanded={mobileMenuOpen}>{mobileMenuOpen ? <X/> : <Menu/>}<span>Modules</span></button>
    <nav className={'module-nav ' + (mobileMenuOpen ? 'mobile-open' : '')} aria-label="Main navigation">
      {modules.map(([label, Icon, href]) => <a key={label} href={href} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => { setActive(label); setMobileMenuOpen(false); }}><Icon size={19}/><span>{label}</span></a>)}
    </nav>
    <div className="subbar"><div><i className="live-dot"/> Workspace <span className="subbar-separator">/</span> {active}</div><span className="preview-label">React migration preview</span></div>
    <main className="page-content">
      <section className="hero"><div className="eyebrow"><i className="live-dot"/> TRADENOVAX · DERIV ACCOUNT</div><h1>Trading Dashboard</h1><p className="hero-copy">Monitor your authenticated Deriv account, live contracts and bot performance from one workspace.</p><div className="hero-actions"><div className="connection"><i className="status-dot"/> Live values load from your Deriv session</div><a className="primary-button" href="/bot/"><Bot size={19}/> Open Bot Builder</a><a className="secondary-button" href="/dashboard.html#connect">Connect Deriv</a></div></section>
      <section className="metrics"><Metric icon={Wallet} title="Balance" detail="Live account balance · USD"/><Metric icon={Activity} title="Open positions" detail="Live contract data"/><Metric icon={ChartNoAxesCombined} title="Session P/L" detail="Authenticated session"/><Metric icon={ShieldCheck} title="Connection" detail="Status from Deriv session"/></section>
      <section className="panel"><div className="panel-heading"><div><h2>Bot Performance</h2><p>Live statistics from your TradeNovaX session</p></div><a className="text-link" href="/bot/">Build strategy →</a></div><div className="stats">{[['Total trades','—'],['Win rate','—'],['Profit/Loss','—'],['Average stake','—']].map(([label,value]) => <div className="stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="empty-chart"><ChartNoAxesCombined size={30}/><strong>Live trading data appears when the session supplies it.</strong></div></section>
      <section className="module-grid"><ModuleCard icon={Bot} title="Bot Builder" text="Build and run strategies in the existing Blockly workspace." href="/bot/"/><ModuleCard icon={Hand} title="Manual Trader" text="Open the existing manual trading module." href="/dashboard.html#manual-trader"/><ModuleCard icon={Activity} title="Bulk Trader" text="Access existing bulk trading tools." href="/dashboard.html#bulk-trader"/><ModuleCard icon={ChartNoAxesCombined} title="Live Positions" text="Review contracts in the trading workspace." href="/dashboard.html#positions"/></section>
    </main>
    <footer className="footer"><strong>TradeNovaX</strong><span>Migration preview · Existing production routes remain unchanged.</span></footer>
  </div>;
}