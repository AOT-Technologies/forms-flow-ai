import React from 'react';
import { render, screen } from '@testing-library/react';
import NoData from '../../../components/Insights/nodashboard';

test('render NoData Component', () => {
  render(<NoData />);
  expect(screen.getByText('No dashboard found'));
});
