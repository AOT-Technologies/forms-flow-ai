import React from 'react';
import { render, screen } from '@testing-library/react';
import Default from '../../../components/Task/nodata';

test('render error message', () => {
    render(<Default />);
    expect(screen.getByText('No tasks found'));
  });
