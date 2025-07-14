import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import SubmissionsAndDraftTable from "../../components/Form/constants/SubmissionsAndDraftTable";
import { toast } from "react-toastify";
import { deleteDraftbyId } from "../../apiManager/services/draftService";
import {
  navigateToDraftEdit,
  navigateToViewSubmission,
} from "../../helper/routerHelper";
import "@testing-library/jest-dom";
import {
  setApplicationListActivePage,
  setCountPerpage,
  setFormSubmissionSort,
} from "../../actions/applicationActions";
import { HelperServices } from "@formsflow/service";

// Mock the action creators
jest.mock("../../actions/applicationActions", () => ({
  setApplicationListActivePage: jest.fn((page) => ({
    type: "SET_APPLICATION_LIST_ACTIVE_PAGE",
    payload: page,
  })),
  setCountPerpage: jest.fn((limit) => ({
    type: "SET_COUNT_PER_PAGE",
    payload: limit,
  })),
  setFormSubmissionSort: jest.fn((sort) => ({
    type: "SET_FORM_SUBMISSION_SORT",
    payload: sort,
  })),
}));

// Mock dependencies
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../../apiManager/services/draftService", () => ({
  deleteDraftbyId: jest.fn(),
}));

jest.mock("../../helper/routerHelper", () => ({
  navigateToDraftEdit: jest.fn(),
  navigateToViewSubmission: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

// Mock the date formatter
// Add this mock at the top of your test file with the other mocks
jest.mock("@formsflow/service", () => ({
  HelperServices: {
    getLocalDateAndTime: jest.fn((date) => `Formatted Date: ${date}`),
  },
}));

jest.mock("@formsflow/components", () => {
  const PropTypes = require("prop-types");
  const CustomButton = ({
    label,
    onClick,
    "data-testid": dataTestId,
    "aria-label": ariaLabel,
  }) => (
    <button
      onClick={onClick}
      data-testid={dataTestId || `button-${label}`}
      aria-label={ariaLabel}
    >
      {label}
    </button>
  );

  CustomButton.propTypes = {
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    "data-testid": PropTypes.string,
    "aria-label": PropTypes.string,
  };

  const TableFooter = ({
    limit,
    activePage,
    totalCount,
    handlePageChange,
    onLimitChange,
    pageOptions,
  }) => (
    <tr data-testid="table-footer">
      <td colSpan="6">
        <div className="pagination-controls">
          <button
            data-testid="previous-page-button"
            onClick={() => handlePageChange(activePage - 1)}
            disabled={activePage === 1}
          >
            Previous
          </button>
          <span data-testid="current-page">{activePage}</span>
          <button
            data-testid="next-page-button"
            onClick={() => handlePageChange(activePage + 1)}
            disabled={activePage * limit >= totalCount}
          >
            Next
          </button>
          <select
            data-testid="limit-selector"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
          >
            {pageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      </td>
    </tr>
  );

  TableFooter.propTypes = {
    limit: PropTypes.number.isRequired,
    activePage: PropTypes.number.isRequired,
    totalCount: PropTypes.number.isRequired,
    handlePageChange: PropTypes.func.isRequired,
    onLimitChange: PropTypes.func.isRequired,
    pageOptions: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.number.isRequired,
        text: PropTypes.string.isRequired,
      })
    ).isRequired,
  };

  const NoDataFound = ({ message }) => (
    <div data-testid="no-data-found">{message}</div>
  );

  NoDataFound.propTypes = {
    message: PropTypes.string.isRequired,
  };

  const ConfirmModal = ({
    show,
    primaryBtnAction,
    title,
    message,
    secondaryBtnAction,
    primaryBtnText,
    secondaryBtnText,
    primaryBtndataTestid,
    secondoryBtndataTestid,
    secondaryBtnDisable,
    secondaryBtnLoading,
  }) =>
    show ? (
      <div data-testid="confirm-modal">
        <h2 data-testid="modal-title">{title}</h2>
        <p data-testid="modal-message">{message}</p>
        <button data-testid={primaryBtndataTestid} onClick={primaryBtnAction}>
          {primaryBtnText}
        </button>
        <button
          data-testid={secondoryBtndataTestid}
          onClick={secondaryBtnAction}
          disabled={secondaryBtnDisable}
        >
          {secondaryBtnLoading ? "Loading..." : secondaryBtnText}
        </button>
      </div>
    ) : null;

  ConfirmModal.propTypes = {
    show: PropTypes.bool.isRequired,
    primaryBtnAction: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    secondaryBtnAction: PropTypes.func.isRequired,
    primaryBtnText: PropTypes.string.isRequired,
    secondaryBtnText: PropTypes.string.isRequired,
    primaryBtndataTestid: PropTypes.string.isRequired,
    secondoryBtndataTestid: PropTypes.string.isRequired,
    secondaryBtnDisable: PropTypes.bool,
    secondaryBtnLoading: PropTypes.bool,
  };

  return {
    CustomButton,
    TableFooter,
    NoDataFound,
    ConfirmModal,
  };
});

// Mock SortableHeader component
jest.mock("../../components/CustomComponents/SortableHeader", () => {
  const PropTypes = require("prop-types");

  function MockSortableHeader({ columnKey, title, currentSort, handleSort }) {
    return (
      <div>
        <button
          data-testid={`${title}-header-btn`}
          onClick={() => handleSort(columnKey)}
        >
          {title} {currentSort[columnKey]?.sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>
    );
  }

  MockSortableHeader.propTypes = {
    columnKey: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    currentSort: PropTypes.object.isRequired,
    handleSort: PropTypes.func.isRequired,
  };

  return MockSortableHeader;
});

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe("SubmissionsAndDraftTable Component", () => {
  let store;
  const fetchSubmissionsAndDrafts = jest.fn();
  const mockDates = {
    created: "2023-01-01T12:00:00",
    modified: "2023-01-02T12:00:00",
  };
  beforeEach(() => {
    store = mockStore({
      tenants: { tenantId: "test-tenant" },
      applications: {
        draftAndSubmissionsList: {
          applications: [
            {
              id: "123",
              formId: "form-123",
              created: mockDates.created,
              modified: mockDates.modified,
              isDraft: true,
              applicationStatus: "",
            },
            {
              id: "456",
              formId: "form-456",
              created: mockDates.created,
              modified: mockDates.modified,
              isDraft: false,
              applicationStatus: "Submitted",
            },
          ],
        },
        activePage: 1,
        countPerPage: 5,
        applicationCount: 2,
        isApplicationLoading: false,
        sort: {
          id: { sortOrder: "asc" },
          created: { sortOrder: "asc" },
          modified: { sortOrder: "asc" },
          type: { sortOrder: "asc" },
          applicationStatus: { sortOrder: "asc" },
          activeKey: "id",
        },
      },
      formCheckList: {
        searchFormLoading: false,
      },
    });

    store.dispatch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the component with submissions and drafts", () => {
    render(
      <Provider store={store}>
        <SubmissionsAndDraftTable
          fetchSubmissionsAndDrafts={fetchSubmissionsAndDrafts}
        />
      </Provider>
    );

    // Check if table headers are rendered
    expect(screen.getByTestId("Submission ID-header-btn")).toBeInTheDocument();
    expect(screen.getByTestId("Submitted On-header-btn")).toBeInTheDocument();
    expect(
      screen.getByTestId("Last Modified On-header-btn")
    ).toBeInTheDocument();
    expect(screen.getByTestId("Type-header-btn")).toBeInTheDocument();
    expect(screen.getByTestId("Status-header-btn")).toBeInTheDocument();
    // Check if action buttons are rendered
    expect(screen.getByTestId("delete-draft-button-123")).toBeInTheDocument();
    expect(screen.getByTestId("continue-draft-button-123")).toBeInTheDocument();
    expect(screen.getByTestId("button-View")).toBeInTheDocument();
  });

  test("displays loading overlay when isApplicationLoading is true", () => {
    const loadingStore = mockStore({
      ...store.getState(),
      applications: {
        ...store.getState().applications,
        isApplicationLoading: true,
      },
    });

    render(
      <Provider store={loadingStore}>
        <SubmissionsAndDraftTable
          fetchSubmissionsAndDrafts={fetchSubmissionsAndDrafts}
        />
      </Provider>
    );

    // Check for loading text
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("displays no data message when there are no submissions or drafts", () => {
    const emptyStore = mockStore({
      ...store.getState(),
      applications: {
        ...store.getState().applications,
        draftAndSubmissionsList: { applications: [] },
      },
    });

    render(
      <Provider store={emptyStore}>
        <SubmissionsAndDraftTable
          fetchSubmissionsAndDrafts={fetchSubmissionsAndDrafts}
        />
      </Provider>
    );

    expect(screen.getByTestId("no-data-found")).toBeInTheDocument();
    expect(screen.getByTestId("no-data-found")).toHaveTextContent(
      'No Submissions or Draft have been found. Create a new submission by clicking the "New Submission " button in the top right.'
    );
  });

  test("handles sorting when a sortable header is clicked", () => {
    render(
      <Provider store={store}>
        <SubmissionsAndDraftTable
          fetchSubmissionsAndDrafts={fetchSubmissionsAndDrafts}
        />
      </Provider>
    );

    // Click on the "Submitted On" header to sort
    fireEvent.click(screen.getByTestId("Submitted On-header-btn"));

    // Check if setFormSubmissionSort was called with correct parameters
    expect(setFormSubmissionSort).toHaveBeenCalledWith(
      expect.objectContaining({
        created: { sortOrder: "desc" },
        id: { sortOrder: "asc" },
        modified: { sortOrder: "asc" },
        type: { sortOrder: "asc" },
        applicationStatus: { sortOrder: "asc" },
        activeKey: "created",
      })
    );
  });

  test("handles continue draft button click", () => {
    render(
      <Provider store={store}>
        <SubmissionsAndDraftTable
          fetchSubmissionsAndDrafts={fetchSubmissionsAndDrafts}
        />
      </Provider>
    );

    // Click on the "Continue" button for a draft
    fireEvent.click(screen.getByTestId("continue-draft-button-123"));

    // Check if navigateToDraftEdit was called with correct parameters
    expect(navigateToDraftEdit).toHaveBeenCalledWith(
      expect.any(Function),
      "test-tenant",
      "form-123",
      "123"
    );
  });

  test("handles view submission button click", () => {
    render(
      <Provider store={store}>
        <SubmissionsAndDraftTable
          fetchSubmissionsAndDrafts={fetchSubmissionsAndDrafts}
        />
      </Provider>
    );

    // Click on the "View" button for a submission
    fireEvent.click(screen.getByTestId("button-View"));

    // Check if navigateToViewSubmission was called with correct parameters
    expect(navigateToViewSubmission).toHaveBeenCalledWith(
      expect.any(Function),
      "test-tenant",
      "form-456",
      "456"
    );
  });

  test("opens delete confirmation modal when delete button is clicked", () => {
    render(
      <Provider store={store}>
        <SubmissionsAndDraftTable
          fetchSubmissionsAndDrafts={fetchSubmissionsAndDrafts}
        />
      </Provider>
    );

    // Click on the "Delete" button for a draft
    fireEvent.click(screen.getByTestId("delete-draft-button-123"));

    // Confirm modal should be visible
    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
    expect(screen.getByTestId("modal-title")).toHaveTextContent(
      "Are You Sure You Want to Delete This Draft?"
    );
    expect(screen.getByTestId("modal-message")).toHaveTextContent(
      "This action cannot be undone."
    );
    expect(screen.getByTestId("no-delete-button")).toHaveTextContent(
      "No, Keep This Draft"
    );
    expect(screen.getByTestId("yes-delete-button")).toHaveTextContent(
      "Yes, Delete this Draft"
    );
  });

  test("closes delete confirmation modal when 'No, Keep This Draft' is clicked", () => {
    render(
      <Provider store={store}>
        <SubmissionsAndDraftTable
          fetchSubmissionsAndDrafts={fetchSubmissionsAndDrafts}
        />
      </Provider>
    );

    // Click on the "Delete" button for a draft
    fireEvent.click(screen.getByTestId("delete-draft-button-123"));

    // Click on the "No, Keep This Draft" button
    fireEvent.click(screen.getByTestId("no-delete-button"));

    // Modal should be closed and deleteDraftbyId should not be called
    expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
    expect(deleteDraftbyId).not.toHaveBeenCalled();
  });

  test("deletes draft when 'Yes, Delete this Draft' is clicked", async () => {
    deleteDraftbyId.mockResolvedValueOnce({});

    render(
      <Provider store={store}>
        <SubmissionsAndDraftTable
          fetchSubmissionsAndDrafts={fetchSubmissionsAndDrafts}
        />
      </Provider>
    );

    // Click on the "Delete" button for a draft
    fireEvent.click(screen.getByTestId("delete-draft-button-123"));

    // Click on the "Yes, Delete this Draft" button
    fireEvent.click(screen.getByTestId("yes-delete-button"));

    // Wait for the delete operation to complete
    await waitFor(() => {
      expect(deleteDraftbyId).toHaveBeenCalledWith("123");
      expect(toast.success).toHaveBeenCalledWith("Draft Deleted Successfully");
      expect(fetchSubmissionsAndDrafts).toHaveBeenCalled();
    });
  });

  test("handles error when draft deletion fails", async () => {
    const errorMessage = "Failed to delete draft";
    deleteDraftbyId.mockRejectedValueOnce({ message: errorMessage });

    render(
      <Provider store={store}>
        <SubmissionsAndDraftTable
          fetchSubmissionsAndDrafts={fetchSubmissionsAndDrafts}
        />
      </Provider>
    );

    // Click on the "Delete" button for a draft
    fireEvent.click(screen.getByTestId("delete-draft-button-123"));

    // Click on the "Yes, Delete this Draft" button
    fireEvent.click(screen.getByTestId("yes-delete-button"));

    // Wait for the delete operation to fail
    await waitFor(() => {
      expect(deleteDraftbyId).toHaveBeenCalledWith("123");
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  test("shows loading state during draft deletion", async () => {
    // Create a promise that we can resolve manually to control the timing
    let resolveDeletePromise;
    const deletePromise = new Promise((resolve) => {
      resolveDeletePromise = resolve;
    });

    deleteDraftbyId.mockReturnValueOnce(deletePromise);

    render(
      <Provider store={store}>
        <SubmissionsAndDraftTable
          fetchSubmissionsAndDrafts={fetchSubmissionsAndDrafts}
        />
      </Provider>
    );

    // Click on the "Delete" button for a draft
    fireEvent.click(screen.getByTestId("delete-draft-button-123"));

    // Click on the "Yes, Delete this Draft" button
    fireEvent.click(screen.getByTestId("yes-delete-button"));

    // The button should be disabled and show loading state
    const deleteButton = screen.getByTestId("yes-delete-button");
    expect(deleteButton).toBeDisabled();

    // Now resolve the promise to complete the deletion
    resolveDeletePromise({});

    // Wait for the delete operation to complete
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Draft Deleted Successfully");
    });
  });

  test("passes correct props to TableFooter for pagination", () => {
    render(
      <Provider store={store}>
        <SubmissionsAndDraftTable
          fetchSubmissionsAndDrafts={fetchSubmissionsAndDrafts}
        />
      </Provider>
    );

    // Check if TableFooter is rendered with correct props
    expect(screen.getByTestId("table-footer")).toBeInTheDocument();
    expect(screen.getByTestId("current-page").textContent).toBe("1");
  });

  test("handles items per page change", () => {
    render(
      <Provider store={store}>
        <SubmissionsAndDraftTable
          fetchSubmissionsAndDrafts={fetchSubmissionsAndDrafts}
        />
      </Provider>
    );

    // Change the items per page
    fireEvent.change(screen.getByTestId("limit-selector"), {
      target: { value: "25" },
    });

    // Check if the correct actions were dispatched
    expect(setCountPerpage).toHaveBeenCalledWith(25);
    expect(setApplicationListActivePage).toHaveBeenCalledWith(1);
  });

  test("displays formatted dates correctly", () => {
    render(
      <Provider store={store}>
        <SubmissionsAndDraftTable
          fetchSubmissionsAndDrafts={fetchSubmissionsAndDrafts}
        />
      </Provider>
    );

    // Check that the HelperServices.getLocalDateAndTime was called with the correct dates
    expect(HelperServices.getLocalDateAndTime).toHaveBeenCalledWith(
      mockDates.created
    );
    expect(HelperServices.getLocalDateAndTime).toHaveBeenCalledWith(
      mockDates.modified
    );
  });

  test("handles search form loading state", () => {
    const loadingSearchStore = mockStore({
      ...store.getState(),
      formCheckList: {
        searchFormLoading: true,
      },
      applications: {
        ...store.getState().applications,
        draftAndSubmissionsList: { applications: [] },
      },
    });

    render(
      <Provider store={loadingSearchStore}>
        <SubmissionsAndDraftTable
          fetchSubmissionsAndDrafts={fetchSubmissionsAndDrafts}
        />
      </Provider>
    );

    // When searchFormLoading is true, no data message should not be shown
    expect(screen.queryByTestId("no-data-found")).not.toBeInTheDocument();
  });

  test("renders empty table when applications array is undefined", () => {
    const undefinedApplicationsStore = mockStore({
      ...store.getState(),
      applications: {
        ...store.getState().applications,
        draftAndSubmissionsList: {},
      },
    });

    render(
      <Provider store={undefinedApplicationsStore}>
        <SubmissionsAndDraftTable
          fetchSubmissionsAndDrafts={fetchSubmissionsAndDrafts}
        />
      </Provider>
    );

    // Should show no data message when applications is undefined
    expect(screen.getByTestId("no-data-found")).toBeInTheDocument();
  });
});
