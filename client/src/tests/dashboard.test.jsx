import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../components/Dashboard';
import { AuthProvider } from '../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import api from '../utils/axios';

// Mock the custom axios instance
vi.mock('../utils/axios');

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
    // Simulate a logged-in user by setting a token
    localStorage.setItem('token', 'mock_valid_token');
  });

  it('should fetch and display a list of sweets', async () => {
    // 1. Arrange: Mock the API response
    const mockSweets = {
      success: true,
      data: [
        { _id: '1', name: 'Rasgulla', price: 10, description: 'Spongy white balls', stock: 5 },
        { _id: '2', name: 'Gulab Jamun', price: 15, description: 'Soft deep-fried balls', stock: 10 }
      ]
    };

    api.get.mockResolvedValue({
      data: mockSweets
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    // 2. Assert: Check if API was called with correct headers
    // Note: We expect the Authorization header to be present
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        '/sweets',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock_valid_token'
          })
        })
      );
    });

    // 3. Assert: Check if data is displayed
    await waitFor(() => {
      expect(screen.getByText(/Rasgulla/i)).toBeInTheDocument();
      expect(screen.getByText(/Gulab Jamun/i)).toBeInTheDocument();
    });
  });

  it('should display stock quantity for each sweet', async () => {
    // Arrange: Mock sweets with stock information
    const mockSweets = {
      success: true,
      data: [
        { _id: '1', name: 'Kaju Katli', price: 100, stock: 5, description: 'Cashew sweet' },
        { _id: '2', name: 'Rasgulla', price: 50, stock: 0, description: 'Out of stock' }
      ]
    };

    api.get.mockResolvedValue({ data: mockSweets });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    // Assert: Stock should be visible
    await waitFor(() => {
      expect(screen.getByText(/5 in stock/i)).toBeInTheDocument();
      expect(screen.getAllByText(/out of stock/i).length).toBeGreaterThan(0);
    });
  });

  it('should disable purchase button when stock is zero', async () => {
    // Arrange: Mock sweet with zero stock
    const mockSweets = {
      success: true,
      data: [
        { _id: '1', name: 'Jalebi', price: 40, stock: 0, description: 'Crispy sweet' }
      ]
    };

    api.get.mockResolvedValue({ data: mockSweets });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    // Assert: Purchase button should be disabled
    await waitFor(() => {
      const purchaseButton = screen.getByRole('button', { name: /out of stock/i });
      expect(purchaseButton).toBeDisabled();
    });
  });

  it('should enable purchase button when stock is available', async () => {
    // Arrange: Mock sweet with stock
    const mockSweets = {
      success: true,
      data: [
        { _id: '1', name: 'Barfi', price: 80, stock: 10, description: 'Milk sweet' }
      ]
    };

    api.get.mockResolvedValue({ data: mockSweets });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    // Assert: Purchase button should be enabled
    await waitFor(() => {
      const purchaseButton = screen.getByRole('button', { name: /purchase/i });
      expect(purchaseButton).not.toBeDisabled();
    });
  });

  it('should call purchase API when purchase button is clicked', async () => {
    // Arrange: Mock sweets and purchase response
    const mockSweets = {
      success: true,
      data: [
        { _id: '123', name: 'Ladoo', price: 60, stock: 3, description: 'Sweet balls' }
      ]
    };

    const mockPurchaseResponse = {
      data: {
        success: true,
        data: { _id: '123', name: 'Ladoo', price: 60, stock: 2, description: 'Sweet balls' }
      }
    };

    api.get.mockResolvedValue({ data: mockSweets });
    api.post.mockResolvedValue(mockPurchaseResponse);

    render(
      <MemoryRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    // Act: Click purchase button
    await waitFor(() => {
      expect(screen.getByText(/Ladoo/i)).toBeInTheDocument();
    });

    const purchaseButton = screen.getByRole('button', { name: /purchase/i });
    fireEvent.click(purchaseButton);

    // Assert: Purchase API should be called
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/sweets/123/purchase',
        { quantity: 1 },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer')
          })
        })
      );
    });
  });

  it('should update stock quantity after successful purchase', async () => {
    // Arrange: Mock sweets with initial stock
    const mockSweets = {
      success: true,
      data: [
        { _id: '456', name: 'Peda', price: 70, stock: 5, description: 'Milk peda' }
      ]
    };

    const mockPurchaseResponse = {
      data: {
        success: true,
        message: 'Purchase successful',
        data: { _id: '456', name: 'Peda', price: 70, stock: 4, description: 'Milk peda' }
      }
    };

    api.get.mockResolvedValue({ data: mockSweets });
    api.post.mockResolvedValue(mockPurchaseResponse);

    render(
      <MemoryRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText(/5 in stock/i)).toBeInTheDocument();
    });

    // Act: Purchase
    const purchaseButton = screen.getByRole('button', { name: /purchase/i });
    fireEvent.click(purchaseButton);

    // Assert: Stock should update to 4
    await waitFor(() => {
      expect(screen.getByText(/4 in stock/i)).toBeInTheDocument();
    });
  });
});