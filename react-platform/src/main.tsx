import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import LandingPage from './LandingPage';
import './styles.css';

const view = new URLSearchParams(window.location.search).get('view');
const showDashboardPreview = view === 'dashboard';
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{showDashboardPreview ? <App /> : <LandingPage />}</React.StrictMode>
);
