import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GroundReportPage from '../pages/GroundReportPage';

describe('GroundReportPage Component', () => {
  it('renders ground report page title', () => {
    render(<GroundReportPage />);
    expect(screen.getByText(/Submit and Verify Ground Hazard Report/i)).toBeInTheDocument();
  });
});
