import React from 'react';
import { render } from '@testing-library/react';
import LoadError from '../../../components/Error/index';

test('render LoadError', () => {
  render(<LoadError />);
});
