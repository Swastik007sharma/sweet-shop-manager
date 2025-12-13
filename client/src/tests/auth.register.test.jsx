import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Register from '../components/Register'; 
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

// Mock axios and navigation
vi.mock('axios');
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
    // 1. Arrange: Mock successful registration
    axios.post.mockResolvedValue({
      data: { success: true, message: 'User registered successfully' }
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // 2. Act: Fill form
    // Note: We use specific placeholders to target the elements
    const emailInput = screen.getByPlaceholderText(/your email address/i);
    const passwordInput = screen.getByPlaceholderText(/choose a password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'new@user.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(registerButton);

    // 3. Assert: API call and Navigation
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/auth/register',
        { email: 'new@user.com', password: 'password123', role: 'user' }
      );
      expect(mockNavigate).toHaveBeenCalledWith('/login'); 
    });
  });
});