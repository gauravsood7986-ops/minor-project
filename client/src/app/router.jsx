import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { ProtectedRoute } from '../components/common/ProtectedRoute.jsx';
import { DashboardLayout } from '../layouts/DashboardLayout.jsx';

// Pages
import { Home } from '../pages/Home.jsx';
import { BrowseServices } from '../pages/BrowseServices.jsx';
import { ServiceDetail } from '../pages/ServiceDetail.jsx';
import { FreelancerProfile } from '../pages/FreelancerProfile.jsx';
import { Register } from '../pages/Register.jsx';
import { Login } from '../pages/Login.jsx';
import { PublishService } from '../pages/PublishService.jsx';
import { EditService } from '../pages/EditService.jsx';
import { DashboardOverview } from '../pages/DashboardOverview.jsx';
import { MyServices } from '../pages/MyServices.jsx';
import { InquiriesPage } from '../pages/InquiriesPage.jsx';
import { ProfileSettings } from '../pages/ProfileSettings.jsx';
import { MyPurchases } from '../pages/MyPurchases.jsx';
import { HowItWorks } from '../pages/HowItWorks.jsx';
import { NotFound } from '../pages/NotFound.jsx';

const RootLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'services', element: <BrowseServices /> },
      { path: 'how-it-works', element: <HowItWorks /> },
      { path: 'services/:id', element: <ServiceDetail /> },
      {
        path: 'services/publish',
        element: (
          <ProtectedRoute>
            <PublishService />
          </ProtectedRoute>
        ),
      },
      {
        path: 'services/:id/edit',
        element: (
          <ProtectedRoute>
            <EditService />
          </ProtectedRoute>
        ),
      },
      { path: 'profiles/:username', element: <FreelancerProfile /> },
      { path: 'register', element: <Register /> },
      { path: 'login', element: <Login /> },

      // Protected User Dashboard routes
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardOverview /> },
          { path: 'purchases', element: <MyPurchases /> },
          { path: 'services', element: <MyServices /> },
          { path: 'inquiries', element: <InquiriesPage /> },
          { path: 'settings', element: <ProfileSettings /> },
        ],
      },

      { path: '*', element: <NotFound /> },
    ],
  },
]);
