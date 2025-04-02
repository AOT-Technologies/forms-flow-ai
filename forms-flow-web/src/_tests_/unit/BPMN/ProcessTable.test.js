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
import '../utils/i18nForTests'; // import to remove warning related to i18n import

jest.mock("connected-react-router", () => ({
  push: jest.fn(),
}));
jest.mock("@formsflow/components", () => ({
  ...jest.requireActual("../../../__mocks__/@formsflow/components"),
  FilterIcon: () => <div>Filter Icon</div>,
  RefreshIcon: () => <div>Refresh Icon</div>,
  SortModal: ({ showSortModal, onClose, primaryBtnAction }) => (
    showSortModal ? (
      <div data-testid="sort-modal">
        <button data-testid="sort-modal-close" onClick={onClose}>Close</button>
        <button data-testid="apply-sort-button" onClick={primaryBtnAction}>Apply Sort</button>
      </div>
    ) : null
  )
}));

const queryClient = new QueryClient();
let store;
let history;

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

describe('ProcessTable Component Tests', () => {
  beforeEach(() => {
    store = configureStore({
      reducer: rootReducer,
      preloadedState: mockstate,
    });
    store.dispatch = jest.fn();
    
    renderWithRouterMatch(ProcessTable, {
      path: "/:viewType",
      route: "/subflow",
    });
    
    store.dispatch.mockClear();
    jest.clearAllMocks();
  });

  it("should render process table header correctly", () => {
    expect(screen.getByTestId("Name-header-btn")).toBeInTheDocument();
    expect(screen.getByTestId("ID-header-btn")).toBeInTheDocument();
    expect(screen.getByTestId("Last Edited-header-btn")).toBeInTheDocument();
    expect(screen.getByTestId("Status-header-btn")).toBeInTheDocument();
  });

  it("should handle process name column sorting", async () => {
    const currentPath = history.location.pathname;
    const viewType = currentPath.split("/")[1];
    const expectedSortType = viewType === "subflow" ? "BPM_SORT" : "DMN_SORT";
    
    const sortButton = screen.getByTestId("Name-header-btn");
    fireEvent.click(sortButton);
    
    await waitFor(() => expect(store.dispatch).toHaveBeenCalled());
    
    const dispatchedFunction = store.dispatch.mock.calls[0][0];
    expect(typeof dispatchedFunction).toBe("function");
    
    await dispatchedFunction(store.dispatch);
    
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expectedSortType,
          payload: expect.objectContaining({
            activeKey: "name",
            name: expect.objectContaining({ sortOrder: "desc" }),
            modified: expect.objectContaining({ sortOrder: "asc" }),
            status: expect.objectContaining({ sortOrder: "asc" }),
            processKey: expect.objectContaining({ sortOrder: "asc" }),
          }),
        })
      );
    });
  });

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
  });

  it('should handle clear search correctly', async () => {
    const searchInput = screen.getByTestId('BPMN-search-input');
    await userEvent.type(searchInput, 'test process');
    
    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(searchInput.value).toBe('');
    expect(store.dispatch).toHaveBeenCalled();
  });


  it('should show loading overlay when isLoading is true', () => {
    const overlay = screen.getByTestId("overlay");
    const loadingOverlay = screen.getByText('Loading...');
    expect(overlay).toBeInTheDocument();
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
    expect(totalItems).toHaveTextContent('51');
    
    const prevButton = screen.getByTestId('left-button');
    const nextButton = screen.getByTestId('right-button');
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    
    const pageDisplay = screen.getByTestId('current-page-display');
    expect(pageDisplay).toBeInTheDocument();
    
    fireEvent.click(nextButton);
    expect(store.dispatch).toHaveBeenCalled();
    
    fireEvent.click(prevButton);
    expect(store.dispatch).toHaveBeenCalled();
    
    const pageSizeDropdown = screen.getByTestId('page-size-dropdown');
    expect(pageSizeDropdown).toBeInTheDocument();
    
    fireEvent.change(pageSizeDropdown, { target: { value: "10" } });
    
    expect(store.dispatch).toHaveBeenCalled();
    const dispatchedAction = store.dispatch.mock.calls[store.dispatch.mock.calls.length - 1][0];
    expect(typeof dispatchedAction).toBe('function');
  });
    it("should redirect to edit page when gotoEdit is called", () => {
    const processItem = mockstate.process.processList[0];
    
    // Mock the dispatch function before configuring store
    const mockDispatch = jest.fn();
    store.dispatch = mockDispatch;
  
    // Get the button and trigger click
    const editButton = screen.getByTestId(`edit-button-${processItem.processKey}`);
    fireEvent.click(editButton);
  
    // Wait for dispatch to be called
    waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: `/subflow/edit/${processItem.processKey}`
        })
      );
    });
  });
  it('should handle filter icon click and sort modal interactions', () => {
    const filterButton = screen.getByTestId('Process-list-filter-bpmn');
    fireEvent.click(filterButton);
    
    const sortModal = screen.getByTestId('sort-modal');
    expect(sortModal).toBeInTheDocument();
    
    const closeButton = screen.getByTestId('sort-modal-close');
    fireEvent.click(closeButton);
    expect(sortModal).not.toBeInTheDocument();
  });

  it('should handle sort modal interactions correctly', async () => {
    const filterButton = screen.getByTestId('Process-list-filter-bpmn');
    fireEvent.click(filterButton);
    
    const sortModal = screen.getByTestId('sort-modal');
    expect(sortModal).toBeInTheDocument();
    
    const applySortButton = screen.getByTestId('apply-sort-button');
    fireEvent.click(applySortButton);
    
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });
  
  it('should handle refresh functionality correctly', async () => {
    const refreshButton = screen.getByTestId('Process-list-refresh-bpmn');
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
    
    // Verify refresh action updates the process list
    const dispatchedAction = store.dispatch.mock.calls[0][0];
    expect(typeof dispatchedAction).toBe('function');
  });

});
