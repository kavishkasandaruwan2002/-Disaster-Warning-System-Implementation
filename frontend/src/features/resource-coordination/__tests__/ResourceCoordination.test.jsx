import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResourceCoordinationPage from '../pages/ResourceCoordinationPage';

describe('ResourceCoordinationPage Component', () => {
  it('renders resource coordination page title', () => {
    render(<ResourceCoordinationPage />);
    expect(screen.getByText(/Coordinate Emergency Resources/i)).toBeInTheDocument();
  });
});
