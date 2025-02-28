import React from 'react';
import { render, screen } from '@testing-library/react';
import CustomProgressBar from '../../components/Modals/ProgressBar'; 
import '@testing-library/jest-dom';

describe('CustomProgressBar', () => {
  test('renders progress bar with the correct progress value', () => {
    render(<CustomProgressBar progress={50} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  test('renders progress bar with 0% when progress is 0', () => {
    render(<CustomProgressBar progress={0} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });

  test('renders progress bar with 100% when progress is 100', () => {
    render(<CustomProgressBar progress={100} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  test('throws prop type error if progress is not passed', () => {
    console.error = jest.fn(); 
    
    render(<CustomProgressBar />);
    
    // Check that PropTypes warning has been triggered
    expect(console.error).toHaveBeenCalled();
  });
});
