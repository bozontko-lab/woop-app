import { createBrowserRouter } from 'react-router';
import { HomePage } from '../features/home/HomePage';
import { NextStepsPage } from '../features/next-steps/NextStepsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { SummaryPage } from '../features/summary/SummaryPage';
import { WizardPage } from '../features/wizard/WizardPage';
import { NotFoundPage, RouteError } from './errors';
import { MainLayout, WizardLayout } from './layouts';

export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'woop/:id', element: <SummaryPage /> },
          { path: 'woop/:id/next', element: <NextStepsPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      { element: <WizardLayout />, children: [{ path: 'wizard/:id', element: <WizardPage /> }] },
    ],
  },
]);
