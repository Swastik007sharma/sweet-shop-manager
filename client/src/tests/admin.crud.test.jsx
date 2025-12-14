import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../components/Dashboard';
import { AuthProvider } from '../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import api from '../utils/axios';

// Mock the custom axios instance
vi.mock('../utils/axios');

describe('Admin CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin UI Visibility', () => {
    it('should show add sweet button for admin users', async () => {
      localStorage.setItem('token', 'mock_admin_token');
      localStorage.setItem('user', JSON.stringify({ email: 'admin@test.com', role: 'admin' }));

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
        expect(screen.getByRole('button', { name: /add sweet/i })).toBeInTheDocument();
      });
    });

    it('should not show add sweet button for regular users', async () => {
      localStorage.setItem('token', 'mock_user_token');
      localStorage.setItem('user', JSON.stringify({ email: 'user@test.com', role: 'user' }));

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
        expect(screen.queryByRole('button', { name: /add sweet/i })).not.toBeInTheDocument();
      });
    });

    it('should show edit and delete buttons on sweet cards for admin', async () => {
      localStorage.setItem('token', 'mock_admin_token');
      localStorage.setItem('user', JSON.stringify({ email: 'admin@test.com', role: 'admin' }));

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
        const editButtons = screen.getAllByRole('button', { name: /edit/i });
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        expect(editButtons.length).toBeGreaterThan(0);
        expect(deleteButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Add Sweet Functionality', () => {
    it('should open add sweet form when add button is clicked', async () => {
      localStorage.setItem('token', 'mock_admin_token');
      localStorage.setItem('user', JSON.stringify({ email: 'admin@test.com', role: 'admin' }));

      const mockSweets = {
        success: true,
        data: []
      };

      api.get.mockResolvedValue({ data: mockSweets });

      render(
        <MemoryRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </MemoryRouter>
      );

      const addButton = await screen.findByRole('button', { name: /add sweet/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^price$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^stock$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^category$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^description$/i)).toBeInTheDocument();
      });
    });

    it('should call POST API when add sweet form is submitted', async () => {
      localStorage.setItem('token', 'mock_admin_token');
      localStorage.setItem('user', JSON.stringify({ email: 'admin@test.com', role: 'admin' }));

      const mockSweets = {
        success: true,
        data: []
      };

      const mockNewSweet = {
        success: true,
        data: {
          _id: '2',
          name: 'New Sweet',
          price: 100,
          stock: 10,
          category: 'Bengali',
          description: 'Delicious'
        }
      };

      api.get.mockResolvedValue({ data: mockSweets });
      api.post.mockResolvedValue({ data: mockNewSweet });

      render(
        <MemoryRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </MemoryRouter>
      );

      const addButton = await screen.findByRole('button', { name: /add sweet/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: 'New Sweet' } });
      fireEvent.change(screen.getByLabelText(/^price$/i), { target: { value: '100' } });
      fireEvent.change(screen.getByLabelText(/^stock$/i), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText(/^category$/i), { target: { value: 'Bengali' } });
      fireEvent.change(screen.getByLabelText(/^description$/i), { target: { value: 'Delicious' } });

      const submitButton = screen.getByRole('button', { name: /submit|save|create/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
          '/sweets',
          expect.objectContaining({
            name: 'New Sweet',
            price: 100,
            stock: 10,
            category: 'Bengali',
            description: 'Delicious'
          }),
          expect.any(Object)
        );
      });
    });
  });

  describe('Edit Sweet Functionality', () => {
    it('should open edit form with pre-filled data when edit button is clicked', async () => {
      localStorage.setItem('token', 'mock_admin_token');
      localStorage.setItem('user', JSON.stringify({ email: 'admin@test.com', role: 'admin' }));

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

      const editButtons = await screen.findAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByLabelText(/^name$/i).value).toBe('Rasgulla');
        expect(screen.getByLabelText(/^price$/i).value).toBe('50');
        expect(screen.getByLabelText(/^stock$/i).value).toBe('5');
      });
    });

    it('should call PUT API when edit form is submitted', async () => {
      localStorage.setItem('token', 'mock_admin_token');
      localStorage.setItem('user', JSON.stringify({ email: 'admin@test.com', role: 'admin' }));

      const mockSweets = {
        success: true,
        data: [
          { _id: '1', name: 'Rasgulla', price: 50, stock: 5, category: 'Bengali', description: 'Soft' }
        ]
      };

      const mockUpdatedSweet = {
        success: true,
        data: {
          _id: '1',
          name: 'Updated Rasgulla',
          price: 60,
          stock: 10,
          category: 'Bengali',
          description: 'Very Soft'
        }
      };

      api.get.mockResolvedValue({ data: mockSweets });
      api.put.mockResolvedValue({ data: mockUpdatedSweet });

      render(
        <MemoryRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </MemoryRouter>
      );

      const editButtons = await screen.findAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: 'Updated Rasgulla' } });
      fireEvent.change(screen.getByLabelText(/^price$/i), { target: { value: '60' } });

      const submitButton = screen.getByRole('button', { name: /submit|save|update/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith(
          '/sweets/1',
          expect.any(Object),
          expect.any(Object)
        );
      });
    });
  });

  describe('Delete Sweet Functionality', () => {
    it('should call DELETE API when delete button is clicked and confirmed', async () => {
      localStorage.setItem('token', 'mock_admin_token');
      localStorage.setItem('user', JSON.stringify({ email: 'admin@test.com', role: 'admin' }));

      const mockSweets = {
        success: true,
        data: [
          { _id: '1', name: 'Rasgulla', price: 50, stock: 5, category: 'Bengali', description: 'Soft' }
        ]
      };

      api.get.mockResolvedValue({ data: mockSweets });
      api.delete.mockResolvedValue({ data: { success: true } });

      // Mock window.confirm
      vi.spyOn(window, 'confirm').mockImplementation(() => true);

      render(
        <MemoryRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </MemoryRouter>
      );

      const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(api.delete).toHaveBeenCalledWith('/sweets/1', expect.any(Object));
      });
    });

    it('should not call DELETE API when deletion is cancelled', async () => {
      localStorage.setItem('token', 'mock_admin_token');
      localStorage.setItem('user', JSON.stringify({ email: 'admin@test.com', role: 'admin' }));

      const mockSweets = {
        success: true,
        data: [
          { _id: '1', name: 'Rasgulla', price: 50, stock: 5, category: 'Bengali', description: 'Soft' }
        ]
      };

      api.get.mockResolvedValue({ data: mockSweets });

      // Mock window.confirm to return false
      vi.spyOn(window, 'confirm').mockImplementation(() => false);

      render(
        <MemoryRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </MemoryRouter>
      );

      const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(api.delete).not.toHaveBeenCalled();
      });
    });
  });
});
