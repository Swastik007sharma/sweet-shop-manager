import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Login from '../components/Login';
import { AuthProvider } from '../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import api from '../utils/axios';

// Mock the custom axios instance
vi.mock('../utils/axios');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  it('should successfully log in a user and navigate to dashboard', async () => {
    // 1. Arrange: Mock a successful API response
    api.post.mockResolvedValue({
      data: {
        success: true,
        token: 'mock_jwt_token',
        user: { id: '123', email: 'test@user.com', role: 'user' }
      },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    // 2. Act: Fill in the form
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@user.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    // 3. Assert: Check API call and Navigation
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/auth/login',
        { email: 'test@user.com', password: 'password123' }
      );
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});