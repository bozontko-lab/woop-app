import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { router } from './app/router';
import { initTheme } from './app/theme';
import { woopRepository } from './data';
import './index.css';
import { initInstallCapture } from './lib/install';
import { initPwa } from './lib/pwa';
import { startReminderNotifier } from './lib/reminderNotifier';

initTheme();
initInstallCapture();
initPwa();
// Bring back edits stashed right before the last reload or closed tab.
void woopRepository.recover();
startReminderNotifier();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
