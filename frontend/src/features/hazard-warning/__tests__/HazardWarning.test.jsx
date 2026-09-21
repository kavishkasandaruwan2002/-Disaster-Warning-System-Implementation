import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HazardWarningPage from '../pages/HazardWarningPage';

describe('HazardWarningPage Component', () => {
  it('renders hazard warning page title', () => {
    render(<HazardWarningPage />);
    expect(screen.getByText(/Issue Location-Specific Hazard Warning/i)).toBeInTheDocument();
  });
});
