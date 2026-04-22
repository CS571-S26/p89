/**
 * Tests for LoginPage.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import LoginPage from '../pages/LoginPage';

const mockNavigate = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../services/musicKit', () => ({
  authorize: vi.fn().mockResolvedValue('mock-user-token'),
  isAuthorized: vi.fn().mockResolvedValue(false),
}));

describe('LoginPage', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('renders the app name', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    expect(screen.getByText('Audify')).toBeInTheDocument();
  });

  it('navigates to /playlists after successful sign-in', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/playlists');
  });

  it('shows an error message when sign-in fails', async () => {
    const { authorize } = await import('../services/musicKit');
    vi.mocked(authorize).mockRejectedValueOnce(new Error('auth failed'));

    const user = userEvent.setup();
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText(/sign in failed/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
