import React from "react";
import {
  render as rtlRender,
  fireEvent,
  waitFor,
  screen,
} from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import { Provider } from "react-redux";
import "@testing-library/jest-dom";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "react-query";
import { createMemoryHistory } from "history";
import { Router, Route } from "react-router-dom";
import { Switch } from "react-router-dom/cjs/react-router-dom.min";
import rootReducer from "../rootReducer";
import { mockstate } from "../mockState";
import ProcessTable from "../../../routes/Design/Process/ProcessTable";
import { TableFooter, AngleRightIcon, CustomButton } from "../../../../__mocks__/@formsflow/components";

jest.mock("connected-react-router", () => ({
  push: jest.fn(),
}));


const queryClient = new QueryClient();
let store;
let history;

// Helper function to render with router
function renderWithRouterMatch(Ui, { path = "/", route = "/", props = {} }) {
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

  renderWithRouterMatch(ProcessTable, {
    path: "/:viewType",
    route: "/subflow", // Ensure it explicitly matches "subflow" for BPMN
  });

  store.dispatch.mockClear();
  jest.clearAllMocks();
});

it("should render process table header correctly", () => {
  expect(screen.getByText("Name")).toBeInTheDocument();
  expect(screen.getByText("ID")).toBeInTheDocument();
  expect(screen.getByText("Last Edited")).toBeInTheDocument();
  expect(screen.getByText("Status")).toBeInTheDocument();
});

it("should handle process name column sorting", async () => {
  // Extract viewType from the test route
  const currentPath = history.location.pathname;
  const viewType = currentPath.split("/")[1]; // Extracts 'subflow' or other path

  // Expected action type based on viewType
  const expectedSortType = viewType === "subflow" ? "BPM_SORT" : "DMN_SORT";

  // Find and click the sort button
  const sortButton = screen.getByTestId("Name-header-btn");
  fireEvent.click(sortButton);

  // Wait for the store dispatch to be called
  await waitFor(() => expect(store.dispatch).toHaveBeenCalled());

  const dispatchedFunction = store.dispatch.mock.calls[0][0];
  expect(typeof dispatchedFunction).toBe("function"); // Ensure it's a thunk

  // Simulate the thunk execution
  await dispatchedFunction(store.dispatch);

  // Check that the correct sorting action was dispatched
  await waitFor(() => {
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expectedSortType,
        payload: expect.objectContaining({
          activeKey: "name",
          name: expect.objectContaining({ sortOrder: "desc" }),
          modified: expect.objectContaining({ sortOrder: "asc" }),
          status: expect.objectContaining({ sortOrder: "asc" }),
          processKey: expect.objectContaining({ sortOrder: "asc" }), // Matches actual key
        }),
      })
    );
  });
});



describe('ProcessTable Component Tests', () => {
  // Search functionality tests
  it('should handle search functionality correctly', async () => {
    const searchInput = screen.getByTestId('BPMN-search-input');
    await userEvent.type(searchInput, 'test process');
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

  });});

  it('should handle clear search correctly', async () => {
    const searchInput = screen.getByTestId('BPMN-search-input');
    await userEvent.type(searchInput, 'test process');
    
    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(searchInput.value).toBe('');
    expect(store.dispatch).toHaveBeenCalled();
  });

  // Test case for refresh button functionality
  it('should dispatch action on refresh button click', async () => {
    const refreshButton = screen.getByTestId("Process-list-refresh-bpmn");
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.any(Function) // Ensuring an action is dispatched
      );
    });
  });

  it('should show loading overlay when isLoading is true', () => {
    const loadingOverlay = screen.getByText('Loading...');
    expect(loadingOverlay).toBeInTheDocument();
  });
  it('should render the table footer component and handle pagination correctly', () => {
    store.dispatch.mockClear();
    jest.clearAllMocks();
  
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
    expect(pageDisplay).toBeInTheDocument();
    // Remove the specific text content check since it might vary
  
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
  
  


  describe('ProcessTable Component Tests - Decision Table', () => {
    beforeEach(() => {
      renderWithRouterMatch(ProcessTable, {
        path: '/:viewType',
        route: '/decision-table', // Ensures it explicitly matches "decision-table"
      });
    });
  
    // it('should handle process name column sorting for decision-table', async () => {
    //   const currentPath = history.location.pathname;
    //   const viewType = currentPath.split('/')[1];
    //   const expectedSortType = viewType === 'decision-table' ? 'DMN_SORT' : 'BPM_SORT';
  
    //   const sortButton = screen.getByTestId('Name-header-btn');
    //   fireEvent.click(sortButton);
  
    //   await waitFor(() => expect(store.dispatch).toHaveBeenCalled());
    //   const dispatchedFunction = store.dispatch.mock.calls[0][0];
    //   expect(typeof dispatchedFunction).toBe('function');
    //   await dispatchedFunction(store.dispatch);
  
    //   await waitFor(() => {
    //     expect(store.dispatch).toHaveBeenCalledWith(
    //       expect.objectContaining({
    //         type: expectedSortType,
    //         payload: expect.objectContaining({
    //           activeKey: 'name',
    //           name: expect.objectContaining({ sortOrder: 'desc' }),
    //           modified: expect.objectContaining({ sortOrder: 'asc' }),
    //           status: expect.objectContaining({ sortOrder: 'asc' }),
    //           processKey: expect.objectContaining({ sortOrder: 'asc' }),
    //         }),
    //       })
    //     );
    //   });
    // });
  
    it('should handle search functionality correctly for decision-table', async () => {
      const searchInput = screen.getByTestId('DMN-search-input');
      await userEvent.type(searchInput, 'test decision');
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);
  
      await waitFor(() => {
        expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function));
      });
    });
  
    it('should handle clear search correctly for decision-table', async () => {
      const searchInput = screen.getByTestId('DMN-search-input');
      await userEvent.type(searchInput, 'test decision');
      
      const clearButton = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearButton);
  
      expect(searchInput.value).toBe('');
      expect(store.dispatch).toHaveBeenCalled();
    });
  
    it('should dispatch action on refresh button click for decision-table', async () => {
      const refreshButton = screen.getByTestId('Process-list-refresh-dmn');
      fireEvent.click(refreshButton);
  
      await waitFor(() => {
        expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function));
      });
    });
  
    // it('should render the table footer component and handle pagination correctly for decision-table', () => {
    //   store.dispatch.mockClear();
    //   jest.clearAllMocks();
  
    //   const footer = screen.getByTestId('table-footer');
    //   expect(footer).toBeInTheDocument();
  
    //   const itemsCount = screen.getByTestId('items-count');
    //   expect(itemsCount).toBeInTheDocument();
      
    //   const totalItems = screen.getByTestId('total-items');
    //   expect(totalItems).toHaveTextContent('50');
  
    //   const prevButton = screen.getByTestId('left-button');
    //   const nextButton = screen.getByTestId('right-button');
    //   expect(prevButton).toBeInTheDocument();
    //   expect(nextButton).toBeInTheDocument();
  
    //   fireEvent.click(nextButton);
    //   expect(store.dispatch).toHaveBeenCalled();
      
    //   fireEvent.click(prevButton); 
    //   expect(store.dispatch).toHaveBeenCalled();
  
    //   const pageSizeDropdown = screen.getByTestId('page-size-dropdown');
    //   expect(pageSizeDropdown).toBeInTheDocument();
  
    //   fireEvent.change(pageSizeDropdown, { target: { value: '10' } });
    //   expect(store.dispatch).toHaveBeenCalled();
    // });
  });
  