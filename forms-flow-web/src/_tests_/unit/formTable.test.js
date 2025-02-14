import React from 'react';
import { render as rtlRender, fireEvent, waitFor, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import { Switch } from 'react-router-dom/cjs/react-router-dom.min';
import { AngleRightIcon, CustomButton, TableFooter } from '../../../__mocks__/@formsflow/components';
import rootReducer from './rootReducer';
import { mockstate } from './mockState';
import FormTable from '../../components/Form/constants/FormTable';
import { ACTION_CONSTANTS } from '../../actions/actionConstants';
import * as formActions from '../../actions/formActions';
// import { setBpmFormSort } from '../../actions/formActions';
// import { push } from 'connected-react-router'; // Assuming push is from connected-react-router
  
jest.mock('connected-react-router', () => ({
  push: jest.fn(),
}));


const queryClient = new QueryClient();
let store;
let history;

// Helper function to render with router
function renderWithRouterMatch(Ui, { path = '/', route = '/', props = {} }) {
   history = createMemoryHistory({ initialEntries: [route] });

  return rtlRender(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Router history={history}>
          <Switch>
            <Route path={path} render={(routeProps) => <Ui {...routeProps} {...props} />} />
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
  store.dispatch = jest.fn();

  renderWithRouterMatch(FormTable, {
    path: '/formflow',
    route: '/formflow',
  
  });
  store.dispatch.mockClear();
  jest.clearAllMocks();

  
});
it('should render form table header correctly', () => {
  expect(screen.getByText('Form Name')).toBeInTheDocument();
  expect(screen.getByText('Description')).toBeInTheDocument();
  expect(screen.getByText('Last Edited')).toBeInTheDocument();
  expect(screen.getByText('Visibility')).toBeInTheDocument();
  expect(screen.getByText('Status')).toBeInTheDocument();
  const strippedText = screen.getByText('Test Description');
  expect(strippedText).toBeInTheDocument();

  // Test row toggling
  const descriptionCell = screen.getByTestId('description-cell');
  expect(descriptionCell).toHaveClass('text-container');
  
  fireEvent.click(descriptionCell);
  expect(descriptionCell).toHaveClass('text-container-expand');

  // Test row collapse
  fireEvent.click(descriptionCell);
  expect(descriptionCell).toHaveClass('text-container'); 


});

it('should handle form name column sorting', async () => {
  const sortButton = screen.getByTestId('Form Name-header-btn');
  fireEvent.click(sortButton);

  // The first call should be a function (thunk)
  const dispatchedFunction = store.dispatch.mock.calls[0][0];
  expect(typeof dispatchedFunction).toBe('function');  // Confirm it's a function (thunk)

  // Now invoke the thunk with store.dispatch
  dispatchedFunction(store.dispatch);

  // Now we can check the second call to dispatch
  expect(store.dispatch).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'BPM_FORM_SORT', // Check for the correct action type
      payload: expect.objectContaining({
        activeKey: 'formName',
        formName: expect.objectContaining({
          sortOrder: 'desc', // Adjust this based on expected sort order
        }),
        modified: expect.objectContaining({
          sortOrder: 'asc',
        }),
        status: expect.objectContaining({
          sortOrder: 'asc',
        }),
        visibility: expect.objectContaining({
          sortOrder: 'asc',
        }),
      }),
    })
  );
});



it('should render form edit correctly', () => {
  const mockFormId = 'mock-form-id';
  const editButton = screen.getByTestId(`form-edit-button-${mockFormId}`);
  expect(editButton).toBeInTheDocument();
  
  // Import the push action
  const { push } = require('connected-react-router');
  
  fireEvent.click(editButton);
  
  // Verify store.dispatch was called with the push action
  expect(store.dispatch).toHaveBeenCalledWith(push('/formflow/mock-form-id/edit'));
});  






it('should render the table footer component and handle pagination correctly', () => {
  store.dispatch.mockClear();
  jest.clearAllMocks();

  // Test footer existence and basic elements
  const footer = screen.getByTestId("table-footer");
  expect(footer).toBeInTheDocument();

  const itemsCount = screen.getByTestId("items-count");
  expect(itemsCount).toBeInTheDocument();
  
  const totalItems = screen.getByTestId("total-items");
  expect(totalItems).toHaveTextContent('50');

  // Test pagination controls
  const prevButton = screen.getByTestId('left-button');
  const nextButton = screen.getByTestId('right-button');
  expect(prevButton).toBeInTheDocument();
  expect(nextButton).toBeInTheDocument();

  const pageDisplay = screen.getByTestId('current-page-display');
  expect(pageDisplay).toHaveTextContent('1');

  // Test pagination button clicks
  fireEvent.click(nextButton);
  expect(store.dispatch).toHaveBeenCalled();
  
  fireEvent.click(prevButton); 
  expect(store.dispatch).toHaveBeenCalled();

  // Test page size dropdown
  const pageSizeDropdown = screen.getByTestId('page-size-dropdown');
  expect(pageSizeDropdown).toBeInTheDocument();

  // Test single page size change instead of loop
  fireEvent.change(pageSizeDropdown, { target: { value: "10" } });
  
  // Verify the dispatch was called with the correct action
  expect(store.dispatch).toHaveBeenCalled();
  const dispatchedAction = store.dispatch.mock.calls[store.dispatch.mock.calls.length - 1][0];
  expect(typeof dispatchedAction).toBe('function');
});



  
  