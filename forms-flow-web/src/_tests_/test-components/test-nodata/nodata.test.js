import React from 'react';
import { render, screen } from '@testing-library/react';
import Nodata from '../../../components/Nodata/Nodata';

test('render NoData', () => {
  render(<Nodata />);
  expect(screen.getByText('No data found'));
});
