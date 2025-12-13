import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../components/Dashboard';
import { AuthProvider } from '../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import api from '../utils/axios';

// Mock the custom axios instance
vi.mock('../utils/axios');

describe('Dashboard Search and Filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock_valid_token');
    localStorage.setItem('user', JSON.stringify({ email: 'test@user.com', role: 'user' }));
  });

  it('should render search input field', async () => {
    const mockSweets = {
      success: true,
      data: [
        { _id: '1', name: 'Rasgulla', price: 50, stock: 5, category: 'Bengali', description: 'Soft' }
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

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search sweets/i)).toBeInTheDocument();
    });
  });

  it('should update search input when user types', async () => {
    const mockSweets = {
      success: true,
      data: [
        { _id: '1', name: 'Rasgulla', price: 50, stock: 5, category: 'Bengali', description: 'Soft' }
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

    const searchInput = await screen.findByPlaceholderText(/search sweets/i);

    fireEvent.change(searchInput, { target: { value: 'Gulab' } });

    expect(searchInput.value).toBe('Gulab');
  });

  it('should call search API when search button is clicked', async () => {
    const mockSweets = {
      success: true,
      data: [
        { _id: '1', name: 'Rasgulla', price: 50, stock: 5, category: 'Bengali', description: 'Soft' }
      ]
    };

    const mockSearchResults = {
      success: true,
      data: [
        { _id: '2', name: 'Gulab Jamun', price: 60, stock: 10, category: 'North Indian', description: 'Sweet' }
      ]
    };

    api.get.mockResolvedValueOnce({ data: mockSweets });
    api.get.mockResolvedValueOnce({ data: mockSearchResults });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    const searchInput = await screen.findByPlaceholderText(/search sweets/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'Gulab' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        '/sweets/search',
        expect.objectContaining({
          params: expect.objectContaining({
            name: 'Gulab'
          })
        })
      );
    });
  });

  it('should display filtered results after search', async () => {
    const mockSweets = {
      success: true,
      data: [
        { _id: '1', name: 'Rasgulla', price: 50, stock: 5, category: 'Bengali', description: 'Soft' }
      ]
    };

    const mockSearchResults = {
      success: true,
      data: [
        { _id: '2', name: 'Gulab Jamun', price: 60, stock: 10, category: 'North Indian', description: 'Sweet' }
      ]
    };

    api.get.mockResolvedValueOnce({ data: mockSweets });
    api.get.mockResolvedValueOnce({ data: mockSearchResults });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Rasgulla/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search sweets/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'Gulab' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/Gulab Jamun/i)).toBeInTheDocument();
      expect(screen.queryByText(/Rasgulla/i)).not.toBeInTheDocument();
    });
  });

  it('should filter by category when category is selected', async () => {
    const mockSweets = {
      success: true,
      data: [
        { _id: '1', name: 'Rasgulla', price: 50, stock: 5, category: 'Bengali', description: 'Soft' },
        { _id: '2', name: 'Gulab Jamun', price: 60, stock: 10, category: 'North Indian', description: 'Sweet' }
      ]
    };

    const mockFilteredResults = {
      success: true,
      data: [
        { _id: '1', name: 'Rasgulla', price: 50, stock: 5, category: 'Bengali', description: 'Soft' }
      ]
    };

    api.get.mockResolvedValueOnce({ data: mockSweets });
    api.get.mockResolvedValueOnce({ data: mockFilteredResults });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    const categorySelect = await screen.findByRole('combobox', { name: /category/i });
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(categorySelect, { target: { value: 'Bengali' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        '/sweets/search',
        expect.objectContaining({
          params: expect.objectContaining({
            category: 'Bengali'
          })
        })
      );
    });
  });

  it('should filter by price range', async () => {
    const mockSweets = {
      success: true,
      data: [
        { _id: '1', name: 'Rasgulla', price: 50, stock: 5, category: 'Bengali', description: 'Soft' },
        { _id: '2', name: 'Gulab Jamun', price: 60, stock: 10, category: 'North Indian', description: 'Sweet' }
      ]
    };

    const mockFilteredResults = {
      success: true,
      data: [
        { _id: '1', name: 'Rasgulla', price: 50, stock: 5, category: 'Bengali', description: 'Soft' }
      ]
    };

    api.get.mockResolvedValueOnce({ data: mockSweets });
    api.get.mockResolvedValueOnce({ data: mockFilteredResults });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    const minPriceInput = await screen.findByLabelText(/min price/i);
    const maxPriceInput = await screen.findByLabelText(/max price/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(minPriceInput, { target: { value: '0' } });
    fireEvent.change(maxPriceInput, { target: { value: '100' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        '/sweets/search',
        expect.objectContaining({
          params: expect.objectContaining({
            minPrice: '0',
            maxPrice: '100'
          })
        })
      );
    });
  });

  it('should reset filters when reset button is clicked', async () => {
    const mockSweets = {
      success: true,
      data: [
        { _id: '1', name: 'Rasgulla', price: 50, stock: 5, category: 'Bengali', description: 'Soft' }
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

    const searchInput = await screen.findByPlaceholderText(/search sweets/i);
    const resetButton = screen.getByRole('button', { name: /reset|clear/i });

    fireEvent.change(searchInput, { target: { value: 'Gulab' } });
    expect(searchInput.value).toBe('Gulab');

    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(searchInput.value).toBe('');
    });
  });
});
