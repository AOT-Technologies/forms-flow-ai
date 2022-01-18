import React from 'react';
import { render } from '@testing-library/react';
import Loading from '../../../components/Loading/index';

it('renders without crashing', () => {
    render(<Loading/>);
  });
  