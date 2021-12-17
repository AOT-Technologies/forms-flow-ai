import React from 'react';
import { render,screen } from '@testing-library/react';
import Footer from "../../../components/Footer/Footer";

test('render Footer', () => {
    render(<Footer />);
    expect(screen.getByText('formsflow.ai').href).toBe('https://formsflow.ai/')
  });
