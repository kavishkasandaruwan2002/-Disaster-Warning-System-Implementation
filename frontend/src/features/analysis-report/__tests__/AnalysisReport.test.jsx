import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnalysisReportPage from '../pages/AnalysisReportPage';

describe('AnalysisReportPage Component', () => {
  it('renders analysis report page title', () => {
    render(<AnalysisReportPage />);
    expect(screen.getByText(/Generate Post-Event Analysis Report/i)).toBeInTheDocument();
  });
});
