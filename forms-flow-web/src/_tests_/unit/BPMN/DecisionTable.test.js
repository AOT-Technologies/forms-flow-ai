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

import i18n from 'i18next';
import { initReactI18next } from "react-i18next";

// Add i18n mock configuration before your tests
i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['translations'],
  defaultNS: 'translations',
  resources: {
    en: {
      translations: {},
    },
  },
});
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

describe('DMN ProcessTable Component Tests', () => {
  beforeEach(() => {
    store = configureStore({
      reducer: rootReducer,
      preloadedState: mockstate,
    });
    store.dispatch = jest.fn();
    
    renderWithRouterMatch(ProcessTable, {
      path: "/:viewType",
      route: "/decision-table",
    });
    
    store.dispatch.mockClear();
    jest.clearAllMocks();
  });

  it("should render DMN table header correctly", () => {
    expect(screen.getByTestId("Name-header-btn")).toBeInTheDocument();
    expect(screen.getByTestId("ID-header-btn")).toBeInTheDocument();
    expect(screen.getByTestId("Last Edited-header-btn")).toBeInTheDocument();
    expect(screen.getByTestId("Status-header-btn")).toBeInTheDocument();
  });

  it("should handle DMN name column sorting", async () => {
    const sortButton = screen.getByTestId("Name-header-btn");
    fireEvent.click(sortButton);
    
    await waitFor(() => expect(store.dispatch).toHaveBeenCalled());
    
    const dispatchedFunction = store.dispatch.mock.calls[0][0];
    expect(typeof dispatchedFunction).toBe("function");
    
    await dispatchedFunction(store.dispatch);
    
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "DMN_SORT",
          payload: expect.objectContaining({
            activeKey: "name",
            name: expect.objectContaining({ sortOrder: "desc" })
          }),
        })
      );
    });
  });

  it('should handle DMN search functionality correctly', async () => {
    const searchInput = screen.getByTestId('DMN-search-input');
    await userEvent.type(searchInput, 'test decision');
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  it('should handle DMN clear search correctly', async () => {
    const searchInput = screen.getByTestId('DMN-search-input');
    await userEvent.type(searchInput, 'test decision');
    
    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(searchInput.value).toBe('');
    expect(store.dispatch).toHaveBeenCalled();
  });

//   it('should dispatch action on DMN refresh button click', async () => {
//     const refreshButton = screen.getByTestId("Process-list-refresh-dmn");
//     fireEvent.click(refreshButton);

//     await waitFor(() => {
//       expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function));
//     });
//   });

  it("should redirect to DMN edit page when gotoEdit is called", () => {
    const dmnItem = mockstate.process.dmnProcessList[0];
    const mockDispatch = jest.fn();
    store.dispatch = mockDispatch;

    const editButton = screen.getByTestId(`edit-button-${dmnItem.processKey}`);
    fireEvent.click(editButton);

    waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: `/dmn/edit/${dmnItem.processKey}`
        })
      );
    });
  });
  it('should handle filter icon click and sort modal interactions', () => {
    const filterButton = screen.getByTestId('Process-list-filter-dmn');
    fireEvent.click(filterButton);
    
    const sortModal = screen.getByTestId('sort-modal');
    expect(sortModal).toBeInTheDocument();
    
    const closeButton = screen.getByTestId('sort-modal-close');
    fireEvent.click(closeButton);
    expect(sortModal).not.toBeInTheDocument();
  });

  it('should handle sort modal interactions correctly', async () => {
    const filterButton = screen.getByTestId('Process-list-filter-dmn');
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
    const refreshButton = screen.getByTestId('Process-list-refresh-dmn');
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
