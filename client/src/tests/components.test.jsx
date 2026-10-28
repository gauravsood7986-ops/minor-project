import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { ServiceCard } from '../components/common/ServiceCard.jsx';
import { Navbar } from '../components/layout/Navbar.jsx';

describe('Frontend Component Tests', () => {
  it('renders EmptyState with custom title, description, and link', () => {
    render(
      <BrowserRouter>
        <EmptyState
          title="No services found"
          description="Try adjusting your filter options."
          actionLabel="Clear Filters"
          actionLink="/services"
        />
      </BrowserRouter>
    );

    expect(screen.getByText('No services found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filter options.')).toBeInTheDocument();
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('renders ServiceCard with accurate title, price, and category', () => {
    const mockService = {
      _id: 'service123456789012345678',
      title: 'Calculus I & II Exam Prep Tutoring',
      category: 'tutoring',
      price: 30,
      currency: 'USD',
      deliveryTime: 2,
      owner: {
        name: 'Jordan Miller',
        username: 'jordanm',
        college: 'State University',
      },
    };

    render(
      <BrowserRouter>
        <ServiceCard service={mockService} />
      </BrowserRouter>
    );

    expect(screen.getAllByText('Calculus I & II Exam Prep Tutoring').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Academic Tutoring').length).toBeGreaterThan(0);
    expect(screen.getByText('$30')).toBeInTheDocument();
    expect(screen.getByText('Jordan Miller')).toBeInTheDocument();
  });

  it('renders ServiceCard with INR currency symbol ₹ correctly', () => {
    const mockInrService = {
      _id: 'serviceInr1234567890123456',
      title: 'Data Structures and Algorithms Notes',
      category: 'study_notes',
      price: 499,
      currency: 'INR',
      deliveryTime: 1,
      owner: {
        name: 'Aarav Sharma',
        username: 'aaravs',
        college: 'IIT Delhi',
      },
    };

    render(
      <BrowserRouter>
        <ServiceCard service={mockInrService} />
      </BrowserRouter>
    );

    expect(screen.getAllByText('Data Structures and Algorithms Notes').length).toBeGreaterThan(0);
    expect(screen.getByText('₹499')).toBeInTheDocument();
  });

  it('renders Navbar with CampusGig brand and navigation links', () => {
    const testStore = configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        },
      },
    });

    render(
      <Provider store={testStore}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Campus')).toBeInTheDocument();
    expect(screen.getByText('Explore Marketplace')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Join Free')).toBeInTheDocument();
  });
});
