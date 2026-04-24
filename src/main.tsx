import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './ui/App';
import { ErrorBoundary } from './ui/components/ErrorBoundary';
import { bootstrapNative } from './platform/native';
import { initCrash } from './telemetry/crash';
import { initAnalytics, trackEvent } from './telemetry/analytics';
import { adProvider, defaultKidsConsent } from './storage/ads';
import './styles/globals.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('root element not found');

void bootstrapNative();
void initCrash();
void initAnalytics().then(() => trackEvent({ kind: 'app_open' }));
void adProvider.init(defaultKidsConsent);

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
