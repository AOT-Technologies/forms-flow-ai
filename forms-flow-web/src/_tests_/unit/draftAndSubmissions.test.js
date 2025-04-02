import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import DraftsAndSubmissions from "../../routes/Submit/Forms/draftAndSubmissions";
import * as applicationServices from "../../apiManager/services/applicationServices";
import * as routerHelper from "../../helper/routerHelper";
import "@testing-library/jest-dom";
import PropTypes from "prop-types";

jest.mock("../../apiManager/services/applicationServices", () => ({
  fetchApplicationsAndDrafts: jest.fn(() => () => Promise.resolve({ applications: [], totalCount: 0 }))
}));

jest.mock("../../helper/routerHelper");

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock("@formsflow/components", () => ({
  CustomSearch: ({ search, setSearch, handleSearch, handleClearSearch, placeholder, dataTestId }) => (
    <div data-testid="mock-custom-search">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        data-testid={dataTestId}
      />
      <button onClick={handleSearch} data-testid="search-button" role="button" aria-label="search">Search</button>
      <button onClick={handleClearSearch} data-testid="clear-button" role="button" aria-label="clear">Clear</button>
    </div>
  ),
  CustomButton: ({ label, onClick, isDropdown, dropdownItems, dataTestId, className, ariaLabel }) => (
    <div data-testid="mock-custom-button">
      <button
        onClick={onClick}
        data-testid={dataTestId}
        className={className}
        aria-label={ariaLabel}
      >
        {label}
      </button>
      {isDropdown && dropdownItems && (
        <div className="dropdown-menu" data-testid="dropdown-menu">
          {dropdownItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              data-testid={item.dataTestId}
              aria-label={item.ariaLabel}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  ),
  BackToPrevIcon: ({ onClick, dataTestId, ariaLabel }) => (
    <button
      onClick={onClick}
      data-testid={dataTestId || "back-to-form-listing"}
      aria-label={ariaLabel}
    >
      Back
    </button>
  ),
  ConnectIcon: () => <div data-testid="mock-connect-icon">Connect Icon</div>,
}));

CustomSearch.propTypes = {
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  handleClearSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  dataTestId: PropTypes.string,
};

CustomButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  isDropdown: PropTypes.bool,
  dropdownItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      dataTestId: PropTypes.string,
      ariaLabel: PropTypes.string,
    })
  ),
  dataTestId: PropTypes.string,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};

BackToPrevIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
  dataTestId: PropTypes.string,
  ariaLabel: PropTypes.string,
};


// Mock FilterSortActions component
jest.mock("../../components/CustomComponents/FilterSortActions", () => {
  const FilterSortActions = ({
    showSortModal,
    handleSortApply,
    handleFilterIconClick,
    handleRefresh,
    handleSortModalClose,
    optionSortBy,
    defaultSortOption,
    defaultSortOrder,
    filterDataTestId,
    refreshDataTestId
  }) => (
    <div data-testid="mock-filter-sort-actions">
      <button
        onClick={handleFilterIconClick}
        data-testid={filterDataTestId}
      >
        Filter/Sort
      </button>
      <button
        onClick={handleRefresh}
        data-testid={refreshDataTestId}
      >
        Refresh
      </button>
      {showSortModal && (
        <div className="sort-modal" data-testid="sort-modal">
          <label htmlFor="sort-by">Sort By</label>
          <select id="sort-by" defaultValue={defaultSortOption} aria-label="Sort By" data-testid="sort-by-select">
            {optionSortBy.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label htmlFor="sort-order">Sort Order</label>
          <select id="sort-order" defaultValue={defaultSortOrder} aria-label="Sort Order" data-testid="sort-order-select">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          <button onClick={() => handleSortApply("modified", "asc")} data-testid="apply-sort-button">Apply</button>
          <button onClick={handleSortModalClose} data-testid="cancel-sort-button">Cancel</button>
        </div>
      )}
    </div>
  );

  FilterSortActions.propTypes = {
    showSortModal: PropTypes.bool.isRequired,
    handleSortApply: PropTypes.func.isRequired,
    handleFilterIconClick: PropTypes.func.isRequired,
    handleRefresh: PropTypes.func.isRequired,
    handleSortModalClose: PropTypes.func.isRequired,
    optionSortBy: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      })
    ).isRequired,
    defaultSortOption: PropTypes.string.isRequired,
    defaultSortOrder: PropTypes.string.isRequired,
    filterDataTestId: PropTypes.string.isRequired,
    refreshDataTestId: PropTypes.string.isRequired,
  };

  return {
    __esModule: true,
    default: FilterSortActions,
  };
});


// Mock SubmissionsAndDraftTable component
jest.mock("../../components/Form/constants/SubmissionsAndDraftTable", () => {
  const SubmissionsAndDraftTable = ({ fetchSubmissionsAndDrafts }) => (
    <div data-testid="mock-submissions-draft-table">
      Submissions and Draft Table
      <button onClick={fetchSubmissionsAndDrafts} data-testid="refresh-table-button">
        Refresh Table
      </button>
    </div>
  );

  SubmissionsAndDraftTable.propTypes = {
    fetchSubmissionsAndDrafts: PropTypes.func.isRequired,
  };

  return {
    __esModule: true,
    default: SubmissionsAndDraftTable,
  };
});


// Create mock store with thunk middleware
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe("DraftsAndSubmissions Component", () => {
  let store;
  const formId = "test-form-id";

  beforeEach(() => {
    // Setup mock store with initial state
    store = mockStore({
      tenants: {
        tenantId: "test-tenant",
      },
      formCheckList: {
        searchFormLoading: false,
      },
      applications: {
        draftAndSubmissionsList: {
          applications: [
            {
              applicationName: "Test Form",
              id: "app-123",
              created: "2023-01-01",
              modified: "2023-01-02",
              applicationStatus: "Submitted",
              type: "Submission",
            },
          ],
          totalCount: 1,
        },
        activePage: 1,
        countPerPage: 10,
        searchParams: "",
        sort: {
          activeKey: "created",
          created: { sortOrder: "desc" },
        },
      },
    });

    // Mock the API calls to return a thunk function
    applicationServices.fetchApplicationsAndDrafts.mockImplementation(() => {
      return () => Promise.resolve({ applications: [], totalCount: 0 });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/form/${formId}/submission`]}>
          <Route path="/form/:formId/submission">
            <DraftsAndSubmissions />
          </Route>
        </MemoryRouter>
      </Provider>
    );
  };

  test("renders the component with form name", async () => {
    renderComponent();

    // Check if the component renders
    expect(screen.getByTestId("mock-submissions-draft-table")).toBeInTheDocument();

    // Verify API was called
    expect(applicationServices.fetchApplicationsAndDrafts).toHaveBeenCalled();
  });

  test("handles search functionality", async () => {
    renderComponent();

    // Type in search box
    const searchInput = screen.getByTestId("form-search-input");
    fireEvent.change(searchInput, { target: { value: "search-term" } });

    // Click search button
    const searchButton = screen.getByTestId("search-button");
    fireEvent.click(searchButton);
  });

  test("clears search when clear button is clicked", async () => {
    renderComponent();

    // Type in search box
    const searchInput = screen.getByTestId("form-search-input");
    fireEvent.change(searchInput, { target: { value: "search-term" } });

    // Click clear button
    const clearButton = screen.getByTestId("clear-button");
    fireEvent.click(clearButton);

    // Verify search input is cleared
    expect(searchInput.value).toBe("");
  });

  test("navigates to new submission when button clicked", () => {
    renderComponent();

    // Click new submission button
    const newSubmissionButton = screen.getByTestId("create-form-button");
    fireEvent.click(newSubmissionButton);

    // Verify navigation function was called
    expect(routerHelper.navigateToNewSubmission).toHaveBeenCalledWith(
      expect.anything(),
      "test-tenant",
      formId
    );
  });

  test("navigates back to form listing when back button clicked", () => {
    renderComponent();

    // Click back button
    const backButton = screen.getByTestId("back-to-form-listing");
    fireEvent.click(backButton);

    // Verify navigation function was called
    expect(routerHelper.navigateToSubmitFormsListing).toHaveBeenCalledWith(
      expect.anything(),
      "test-tenant"
    );
  });

  test("refreshes data when refresh button clicked", () => {
    renderComponent();

    // Reset the mock to track new calls
    applicationServices.fetchApplicationsAndDrafts.mockClear();

    // Click refresh button
    const refreshButton = screen.getByTestId("form-list-refresh");
    fireEvent.click(refreshButton);

    // Verify API was called again
    expect(applicationServices.fetchApplicationsAndDrafts).toHaveBeenCalled();
  });

  test("opens sort modal when filter/sort button is clicked", () => {
    renderComponent();

    // Click filter/sort button
    const filterButton = screen.getByTestId("form-list-filter");
    fireEvent.click(filterButton);

    // Verify sort modal is shown
    expect(screen.getByTestId("sort-modal")).toBeInTheDocument();
  });

  test("applies sort when sort is selected and applied", () => {
    renderComponent();
    const filterButton = screen.getByTestId("form-list-filter");
    fireEvent.click(filterButton);
  });

  test("closes sort modal when cancel button is clicked", () => {
    renderComponent();

    // Open sort modal
    const filterButton = screen.getByTestId("form-list-filter");
    fireEvent.click(filterButton);

    // Click cancel button
    const cancelButton = screen.getByTestId("cancel-sort-button");
    fireEvent.click(cancelButton);

    // Verify sort modal is closed
    expect(screen.queryByTestId("sort-modal")).not.toBeInTheDocument();
  });

  test("refreshes table when refresh table button is clicked", () => {
    renderComponent();

    // Reset the mock to track new calls
    applicationServices.fetchApplicationsAndDrafts.mockClear();

    // Click refresh table button
    const refreshTableButton = screen.getByTestId("refresh-table-button");
    fireEvent.click(refreshTableButton);

    // Verify API was called again
    expect(applicationServices.fetchApplicationsAndDrafts).toHaveBeenCalled();
  });

});
