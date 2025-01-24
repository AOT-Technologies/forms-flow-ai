import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from 'react-query';
import rootReducer from './rootReducer';
import { mockstate } from './mockState';
import List from '../../components/Form/List'; 
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import { Switch } from 'react-router-dom/cjs/react-router-dom.min';

 
const queryClient = new QueryClient();
let store = configureStore({
  reducer: rootReducer,
  preloadedState: mockstate,
});

function renderWithRouterMatch(Ui, { path = '/', route = '/' }) {
  const history = createMemoryHistory({ initialEntries: [route] });

  return rtlRender(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Router history={history}>
          <Switch>
            <Route path={path} component={Ui} />
          </Switch>
        </Router>
      </Provider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  store = configureStore({
    reducer: rootReducer,
    preloadedState: mockstate,
  });
});

it('should render the list component without breaking', async () => {
  renderWithRouterMatch(List, {
    path: '/formflow',
    route: '/formflow',
  });

  const button = screen.getByText("New Form");
  expect(button).toBeInTheDocument();
});
