import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import LandingPage from './LandingPage';
import './styles.css';

const isLandingPreview = new URLSearchParams(window.location.search).get('view') === 'landing';
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{isLandingPreview ? <LandingPage /> : <App />}</React.StrictMode>
);
