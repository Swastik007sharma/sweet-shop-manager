import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../components/Dashboard';
import { AuthProvider } from '../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
    // Simulate a logged-in user by setting a token
    localStorage.setItem('token', 'mock_valid_token');
  });

  it('should fetch and display a list of sweets', async () => {
    // 1. Arrange: Mock the API response
    const mockSweets = [
      { _id: '1', name: 'Rasgulla', price: 10, description: 'Spongy white balls' },
      { _id: '2', name: 'Gulab Jamun', price: 15, description: 'Soft deep-fried balls' }
    ];

    axios.get.mockResolvedValue({
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
      expect(axios.get).toHaveBeenCalledWith(
        '/api/sweets',
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
});