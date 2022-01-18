import React from 'react';
import { render, screen } from '@testing-library/react';
import Nodata from '../../../../components/Application/nodata';

test('render Nodata', () => {
  render(<Nodata/>);
  expect(screen.getByText('No applications found'));


});