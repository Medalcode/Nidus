import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App Component', () => {
  it('renders home view by default', () => {
    render(<App />);
    expect(screen.getByText(/Nidius Suite/i)).toBeInTheDocument();
  });

  it('has theme toggle button', () => {
    render(<App />);
    const themeButton = screen.getByRole('button', { name: /switch to/i });
    expect(themeButton).toBeInTheDocument();
  });

  it('has language toggle button', () => {
    render(<App />);
    const langButton = screen.getByRole('button', { name: /change language/i });
    expect(langButton).toBeInTheDocument();
  });
});
