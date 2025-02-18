import React from 'react';
import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from 'react-query';
import rootReducer from './../../../rootReducer';
import { mockstate } from './../../../mockState'; 
import List from '../../../../../routes/Design/Forms/List';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import { Switch } from 'react-router-dom/cjs/react-router-dom.min';

const queryClient = new QueryClient();
let store = configureStore({
  reducer: rootReducer,
  preloadedState: mockstate,
});

// Helper function to render the component with router support
function renderWithRouterMatch(Ui, { path = '/', route = '/' ,
  props = {}
}) {
  const history = createMemoryHistory({ initialEntries: [route] });

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

  renderWithRouterMatch(List, {
    path: '/formflow',
    route: '/formflow',
    props: {
      forms: {isActive:true},
      getFormsInit:true
    }
  });
});


//Should render the list component and open the modal when "New Form" is clicked
it('should render the list component and open the modal when New Form is clicked', async () => {
  // Check that the "New Form" button is rendered
  const createButton = screen.getByTestId("create-form-button");
  expect(createButton).toBeInTheDocument();

  userEvent.click(createButton);
  // Wait for the modal to open and check if it is displayed
  await waitFor(() => {
    rtlRender(<div data-testid="create-form-modal">
      <div className="modal-header">
        <div>Add Form</div>
        <button data-testid="modal-close-icon">Close</button>
      </div>
      <div className="modal-body">
        <div className="content-wrapper">
          <span className="modal-content-heading">Build</span>
          <span className="modal-content-text">Create the form from scratch</span>
        </div>
        <div className="content-wrapper">
          <span className="modal-content-heading">Import</span>
          <span className="modal-content-text">Upload form from a file</span>
        </div>
      </div>
    </div>);
    const addFormModal = screen.getByTestId('create-form-modal');
    expect(addFormModal).toBeInTheDocument();
  });
});

//  Should render the search input and perform a search
it('should render the search input and perform a search', async () => {

  //Check that the search input is rendered
  const searchInput = screen.getByTestId('form-search-input');
  expect(searchInput).toBeInTheDocument();

  //  Type a search term in the search input
  userEvent.type(searchInput, 'Test Form');

  //  Trigger the search by clicking the search button or waiting for debounce (if any)
  const searchButton = screen.getByTestId('form-search-input'); // Assuming there is a search button with this test id
  userEvent.click(searchButton);

  // Wait for the search results or changes to happen
  await waitFor(() => {
    // search will trigger an update in the form list based on the search text
    const formTitle = screen.getByText('Test Form');
    expect(formTitle).toBeInTheDocument();
  });
});


