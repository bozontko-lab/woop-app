import { createBrowserRouter } from 'react-router';
import { AboutPage } from '../features/about/AboutPage';
import { HomePage } from '../features/home/HomePage';
import { LibraryPage } from '../features/library/LibraryPage';
import { NextStepsPage } from '../features/next-steps/NextStepsPage';
import { CheckinPage } from '../features/practice/CheckinPage';
import { RehearsalPage } from '../features/practice/RehearsalPage';
import { SosPage } from '../features/practice/SosPage';
import { ProgressPage } from '../features/progress/ProgressPage';
import { ClosePage } from '../features/review/ClosePage';
import { ReviewPage } from '../features/review/ReviewPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { SummaryPage } from '../features/summary/SummaryPage';
import { WizardPage } from '../features/wizard/WizardPage';
import { NotFoundPage, RouteError } from './errors';
import { FocusLayout, MainLayout } from './layouts';

export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'woop/:id', element: <SummaryPage /> },
          { path: 'woop/:id/progress', element: <ProgressPage /> },
          { path: 'woop/:id/next', element: <NextStepsPage /> },
          { path: 'library', element: <LibraryPage /> },
          { path: 'about', element: <AboutPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        element: <FocusLayout />,
        children: [
          { path: 'wizard/:id', element: <WizardPage /> },
          { path: 'woop/:id/sos', element: <SosPage /> },
          { path: 'woop/:id/rehearse', element: <RehearsalPage /> },
          { path: 'woop/:id/checkin', element: <CheckinPage /> },
          { path: 'woop/:id/review', element: <ReviewPage /> },
          { path: 'woop/:id/close', element: <ClosePage /> },
        ],
      },
    ],
  },
]);
