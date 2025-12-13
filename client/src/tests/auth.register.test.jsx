import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Register from '../components/Register'; 
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

describe('Register Component', () => {
  it('should register a user and navigate to login', async () => {
    // 1. Arrange
    api.post.mockResolvedValue({
      data: { success: true, message: 'User registered successfully' }
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // 2. Act
    const emailInput = screen.getByPlaceholderText(/your email address/i);
    const passwordInput = screen.getByPlaceholderText(/choose a password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'new@user.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(registerButton);

    // 3. Assert
    // Verify API call
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/auth/register',
        { email: 'new@user.com', password: 'password123', role: 'user' }
      );
    });

    // Verify Navigation (Wait up to 2 seconds for the 1 second delay to finish)
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login'); 
    }, { timeout: 2000 }); 
  });
});