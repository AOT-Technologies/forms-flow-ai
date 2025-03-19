import React from "react";
import { render as rtlRender, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider, useDispatch } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "react-query";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import rootReducer from "../../rootReducer";
import { mockstate } from "../../mockState";
import ViewApplication from "../../../../../src/routes/Submit/Submission/SubmissionView";
import thunk from "redux-thunk";

// Mock application services
jest.mock("../../../../../src/apiManager/services/applicationServices", () => ({
  getApplicationById: jest.fn().mockImplementation((applicationId) => (dispatch) => {
    const mockData = {
      created: "2025-02-11T05:15:55.785503Z",
      modified: "2025-02-11T05:22:34.207536Z",
      id: 804,
      applicationName: "BusinessNew",
      applicationStatus: "Reviewed",
      formProcessMapperId: "531",
      processInstanceId: "52e9e47b-e837-11ef-9ea0-620c3eb0f440",
      processKey: "BusinessNew",
      processName: "BusinessNew",
      processTenant: null,
      createdBy: "john.honai",
      modifiedBy: "service-account-forms-flow-bpm",
      formId: "6721debe9c3135103599ba2b",
      submissionId: "67aade995c702e11810155b2",
      isResubmit: false,
      eventName: null,
    };

    dispatch({ type: "APPLICATION_DETAIL", payload: mockData });
    dispatch({ type: "APPLICATION_DETAIL_STATUS_CODE", payload: 200 });

    return Promise.resolve({ data: mockData });
  }),
}));

// Mock Redux actions
jest.mock("../../../../../src/actions/applicationActions", () => ({
  setApplicationDetail: jest.fn().mockImplementation((data) => (dispatch) => {
    dispatch({ type: "APPLICATION_DETAIL", payload: data });
  }),

  setApplicationDetailStatusCode: jest.fn().mockImplementation((status) => (dispatch) => {
    dispatch({ type: "APPLICATION_DETAIL_STATUS_CODE", payload: status });
  }),

  setApplicationDetailLoader: jest.fn().mockImplementation(() => (dispatch) => {
    dispatch({ type: "APPLICATION_DETAIL_LOADER", payload: true });
  }),
}));

// Mock FormsFlow UI components
jest.mock("@formsflow/components", () => {
  return {
    BackToPrevIcon: () => <button data-testid="back-button">Back</button>,
    HistoryIcon: () => <span>History Icon</span>,
    CloseIcon: () => <span>Close Icon</span>,
    CustomButton: ({ onClick }) => (
      <button data-testid="handle-submission-history-testid" onClick={onClick}>
        History
      </button>
    ),
    FormSubmissionHistoryModal: ({ show, onClose }) => (
      <div data-testid="history-modal" style={{ display: show ? 'block' : 'none' }}>
        Form Submission History Modal
        <button data-testid="close-modal" onClick={onClose}>Close</button>
      </div>
    ),
  };
});

// Mock application audit services
jest.mock("../../../../../src/apiManager/services/applicationAuditServices", () => ({
  fetchApplicationAuditHistoryList: jest.fn().mockImplementation((applicationId) => (dispatch) => {
    dispatch({ 
      type: "APPLICATION_HISTORY", 
      payload: [
        { 
          id: 1, 
          applicationStatus: "New", 
          created: "2025-02-10T05:15:55.785503Z" 
        },
        { 
          id: 2, 
          applicationStatus: "Reviewed", 
          created: "2025-02-11T05:15:55.785503Z" 
        }
      ] 
    });
    dispatch({ type: "APPLICATION_HISTORY_LOADING", payload: false });
    return Promise.resolve();
  }),
}));

// Mock helper functions
jest.mock("../../../../../src/helper/routerHelper", () => ({
  navigateToFormEntries: jest.fn(),
}));

// Mock PDF download component
jest.mock("../../../../../src/components/Form/ExportAsPdf/downloadPdfButton", () => () => (
  <button data-testid="download-pdf-button">Download PDF</button>
));

// Mock View component
jest.mock("../../../../../src/routes/Submit/Submission/Item/View", () => () => (
  <div data-testid="application-view">Application View Content</div>
));

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));

const queryClient = new QueryClient();

// Function to render component with providers
function renderWithProviders(ui, { route = "/application/804" } = {}) {
  const history = createMemoryHistory({ initialEntries: [route] });

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
    preloadedState: mockstate,
  });

  return {
    ...rtlRender(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <Router history={history}>{ui}</Router>
        </Provider>
      </QueryClientProvider>
    ),
    store,
    history,
  };
}

// Initialize store before each test
let store;
beforeEach(() => {
  store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
    preloadedState: {
      ...mockstate,
      applications: {
        applicationsList: [],
        applicationDetail:
          {
            created: "2025-02-11T05:15:55.785503Z",
            modified: "2025-02-11T05:22:34.207536Z",
            id: 804,
            applicationName: "BusinessNew",
            applicationStatus: "Reviewed",
            formProcessMapperId: "531",
            processInstanceId: "52e9e47b-e837-11ef-9ea0-620c3eb0f440",
            processKey: "BusinessNew",
            processName: "BusinessNew",
            processTenant: null,
            createdBy: "john.honai",
            modifiedBy: "service-account-forms-flow-bpm",
            formId: "6721debe9c3135103599ba2b",
            submissionId: "67aade995c702e11810155b2",
            isResubmit: false,
            eventName: null,
          },
        applicationProcess: {
          processName: "BusinessNew",
          formProcessMapperId: "531",
          processKey: "BusinessNew",
        },
        formApplicationsList: [],
        isApplicationListLoading: false,
        isApplicationDetailLoading: false,
        isApplicationUpdating: false,
        applicationCount: 0,
        applicationDetailStatusCode: 200,
        activePage: 1,
        countPerPage: 5,
        applicationStatus: [],
        iserror: false,
        error: "",
        isPublicStatusLoading: false,
        sortOrder: "desc",
        sortBy: "id",
        searchParams: {},
        isApplicationLoading: false,
      },
      submission: { submission: { _id: "67aade995c702e11810155b2" } },
      form: { form: { _id: "6721debe9c3135103599ba2b", title: "Business Form" } },
      taskAppHistory: { appHistory: [], isHistoryListLoading: false },
      tenants: { tenantId: "tenant123" },
      user: {
        roles: ["formsflow-reviewer"],
        authenticated: true,
        viewSubmissions: true,
        createSubmissions: true,
      },
    },
  });
});

const mockDispatch = jest.fn();

describe("ViewApplication Component", () => {
  beforeEach(() => {
    useDispatch.mockReturnValue(mockDispatch);
    jest.clearAllMocks();
  });

  it("renders the submission view correctly", async () => {
    renderWithProviders(<ViewApplication />);
    await waitFor(() => {
      expect(screen.getByText("Business New")).toBeInTheDocument();
    });
  });

  it("displays the application status correctly", async () => {
    renderWithProviders(<ViewApplication />);
    await waitFor(() => {
      expect(screen.getByTestId("submissions-details")).toBeInTheDocument();
      expect(screen.getByText(/Submitted On/)).toBeInTheDocument();
    });
  });

  it("shows the history modal when history button is clicked", async () => {
    renderWithProviders(<ViewApplication />);
    
    await waitFor(() => {
      expect(screen.getByTestId("handle-submission-history-testid")).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId("handle-submission-history-testid"));
    
    await waitFor(() => {
      expect(screen.getByTestId("history-modal")).toHaveStyle("display: block");
    });
  });

  it("renders the download PDF button", async () => {
    renderWithProviders(<ViewApplication />);
    
    await waitFor(() => {
      expect(screen.getByTestId("download-pdf-button")).toBeInTheDocument();
    });
  });

  it("renders the application view content", async () => {
    renderWithProviders(<ViewApplication />);
    
    await waitFor(() => {
      expect(screen.getByTestId("application-view")).toBeInTheDocument();

    });
  });

});

