import React from 'react';
import { render } from '@testing-library/react';
import {SpinnerSVG} from '../../containers/SpinnerSVG';
test('render spinner', () => {
    render(<SpinnerSVG />);
  });
