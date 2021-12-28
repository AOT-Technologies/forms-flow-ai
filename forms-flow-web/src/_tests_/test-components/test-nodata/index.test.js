import React from 'react';
import { render } from '@testing-library/react';
import Nodata from '../../../components/Nodata/index';

it('renders without crashing', () => {
    render(<Nodata />);
  });
