import DashboardPage from './pages/DashboardPage';
import SiteDetailPage from './pages/SiteDetailPage';
import BlueprintPage from './pages/BlueprintPage';
import CarbonReportPage from './pages/CarbonReportPage';
import { AppLayout } from './components/layouts/AppLayout';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

const withLayout = (element: ReactNode) => (
  <AppLayout>{element}</AppLayout>
);

export const routes: RouteConfig[] = [
  {
    name: 'Dashboard',
    path: '/',
    element: withLayout(<DashboardPage />),
    public: true,
  },
  {
    name: 'Site Detail',
    path: '/site/:id',
    element: withLayout(<SiteDetailPage />),
    public: true,
  },
  {
    name: 'Blueprint Viewer',
    path: '/blueprint/:id',
    element: withLayout(<BlueprintPage />),
    public: true,
  },
  {
    name: 'Carbon Report',
    path: '/report',
    element: withLayout(<CarbonReportPage />),
    public: true,
  },
];
