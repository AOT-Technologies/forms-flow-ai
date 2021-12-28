import React from 'react';
import { render } from '@testing-library/react';
import Index from '../../../components/Insights/index';
import StoreService from '../../../services/StoreService';
import {Provider} from "react-redux";
const store = StoreService.configureStore();
it('renders Insight component without crashing', () => {
    render(<Provider store={store}><Index/></Provider>);
  });
