import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../context/AuthContext';

jest.mock('../services/authService', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));

import { authService } from '../services/authService';

function TestConsumer() {
  const { user, token, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.email : 'none'}</span>
      <span data-testid="token">{token || 'none'}</span>
      <button onClick={() => login('u@test.com', 'pass')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

test('login saves token and user to localStorage and updates state', async () => {
  authService.login.mockResolvedValue({
    token: 'jwt-abc',
    user: { id: 1, email: 'u@test.com' },
  });

  render(<AuthProvider><TestConsumer /></AuthProvider>);
  await act(() => userEvent.click(screen.getByText('Login')));

  expect(screen.getByTestId('token').textContent).toBe('jwt-abc');
  expect(screen.getByTestId('user').textContent).toBe('u@test.com');
  expect(localStorage.getItem('jwt')).toBe('jwt-abc');
  expect(JSON.parse(localStorage.getItem('user')).email).toBe('u@test.com');
});

test('logout clears localStorage and resets state', async () => {
  localStorage.setItem('jwt', 'existing-token');
  localStorage.setItem('user', JSON.stringify({ id: 1, email: 'u@test.com' }));

  render(<AuthProvider><TestConsumer /></AuthProvider>);
  expect(screen.getByTestId('token').textContent).toBe('existing-token');

  await act(() => userEvent.click(screen.getByText('Logout')));

  expect(screen.getByTestId('token').textContent).toBe('none');
  expect(screen.getByTestId('user').textContent).toBe('none');
  expect(localStorage.getItem('jwt')).toBeNull();
  expect(localStorage.getItem('user')).toBeNull();
});

test('initial state is loaded from localStorage on mount', () => {
  localStorage.setItem('jwt', 'persisted-token');
  localStorage.setItem('user', JSON.stringify({ id: 2, email: 'persisted@test.com' }));

  render(<AuthProvider><TestConsumer /></AuthProvider>);

  expect(screen.getByTestId('token').textContent).toBe('persisted-token');
  expect(screen.getByTestId('user').textContent).toBe('persisted@test.com');
});
