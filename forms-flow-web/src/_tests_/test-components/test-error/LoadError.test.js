import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadError from '../../../components/Error/index';

test('render LoadError with nostyle', () => {
  render(<LoadError noStyle="true" text="Something went wrong." />);
  expect(screen.getByText('Something went wrong.'));


});

test('render LoadError', () => {
  render(<LoadError />);
  expect(screen.getByText('Something went wrong.'));
});
