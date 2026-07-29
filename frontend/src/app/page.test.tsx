import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /Faites de chaque/i })).toBeInTheDocument();
  });

  it('renders the login link', () => {
    render(<Home />);
    expect(screen.getByRole('link', { name: /Se connecter/i })).toHaveAttribute('href', '/login');
  });

  it('renders the signup link', () => {
    render(<Home />);
    expect(screen.getByRole('link', { name: /compte/i })).toHaveAttribute('href', '/register');
  });
});
