import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { router } from './router.jsx';
import { checkAuthSession } from '../features/auth/authSlice.js';
import { authApi } from '../api/auth.api.js';

export const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Acquire CSRF token and verify existing session on initial load
    authApi.getCsrf().catch(() => {});
    dispatch(checkAuthSession());
  }, [dispatch]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            fontSize: '13px',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
};

export default App;
