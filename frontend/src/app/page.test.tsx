import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Page d\'accueil', () => {
  it('affiche le titre SmartReunion', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /SmartReunion/i })).toBeInTheDocument();
  });

  it('affiche le lien Connexion', () => {
    render(<Home />);
    const link = screen.getByRole('link', { name: /Connexion/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/login');
  });

  it('affiche les liens Réunions et Admin', () => {
    render(<Home />);
    expect(screen.getByRole('link', { name: /Réunions/i })).toHaveAttribute('href', '/meetings');
    expect(screen.getByRole('link', { name: /Admin/i })).toHaveAttribute('href', '/admin/users');
  });
});
