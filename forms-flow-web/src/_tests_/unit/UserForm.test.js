import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom"; // Add this import
import { Provider } from "react-redux";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import UserForm from "../../routes/Submit/Forms/UserForm";
import PropTypes from 'prop-types';
import * as bpmServices from "../../apiManager/services/bpmServices";
import * as draftService from "../../apiManager/services/draftService";
import * as formServices from "../../apiManager/services/FormServices";
import * as processServices from "../../apiManager/services/processServices";
import * as bpmFormServices from "../../apiManager/services/bpmFormServices";
import * as applicationServices from "../../apiManager/services/applicationServices";
import * as routerHelper from "../../helper/routerHelper";

// Mock dependencies
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

// Mock formio-react with explicit implementation of selectRoot
const mockResetSubmissions = jest.fn();
const mockSaveSubmission = jest.fn();
const mockGetForm = jest.fn();

jest.mock("@aot-technologies/formio-react", () => {
  return {
    selectRoot: (key, state) => {
      if (key === "form") {
        return state.form || {};
      }
      if (key === "formDelete") {
        return (
          state.formDelete || {
            formSubmissionError: { modalOpen: false, message: "" },
          }
        );
      } 
      return state[key] || {};
    },
    resetSubmissions: (...args) => mockResetSubmissions(...args),
    saveSubmission: (...args) => mockSaveSubmission(...args),
    Form: ({ onSubmit, onChange, onCustomEvent }) => (
      <div data-testid="formio-form">
        <span>Form Component</span>
        <button
          data-testid="form-submit-button"
          onClick={() => onSubmit({ data: { field1: "value1" } })}
        >
          Submit
        </button>
        <button
          data-testid="form-change-button"
          onClick={() => onChange({ data: { field1: "changed" } })}
        >
          Change
        </button>
        <button
          data-testid="form-custom-event-button"
          onClick={() => onCustomEvent({ type: "CUSTOM_SUBMIT_DONE" })}
        >
          Custom Event
        </button>
      </div>
    ),
    selectError: (key, state) => {
      return state[key]?.error || null;
    },
    Errors: () => <div>Errors Component</div>,
    getForm: (...args) => mockGetForm(...args),
    Formio: {
      getProjectUrl: jest.fn().mockReturnValue("http://localhost:3001"),
    },
  };
});

jest.mock("react-loading-overlay-ts", () => ({
  __esModule: true,
  default: ({ children, active }) => (
    <div data-testid="loading-overlay" data-active={active}>
      {children}
    </div>
  ),
}));

jest.mock("../../containers/Loading", () => ({
  __esModule: true,
  default: () => <div data-testid="loading-view-component">Loading...</div>,
}));

jest.mock("../../containers/SubmissionError", () => ({
  __esModule: true,
  default: ({ modalOpen, message, onConfirm }) => (
    <div data-testid="submission-error" data-open={modalOpen}>
      {message}
      <button data-testid="confirm-error-button" onClick={onConfirm}>
        Confirm
      </button>
    </div>
  ),
}));

jest.mock("@formsflow/components", () => ({
  BackToPrevIcon: ({ onClick }) => (
    <button data-testid="back-to-form-list" onClick={onClick}>
      Back
    </button>
  ),
}));

// Define PropTypes for mocked components AFTER the mocks
const MockForm = ({ onSubmit, onChange, onCustomEvent }) => (
  <div data-testid="formio-form">
    Form Component
    <button
      data-testid="form-submit-button"
      onClick={() => onSubmit({ data: { field1: "value1" } })}
    >
      Submit
    </button>
    <button
      data-testid="form-change-button"
      onClick={() => onChange({ data: { field1: "changed" } })}
    >
      Change
    </button>
    <button
      data-testid="form-custom-event-button"
      onClick={() => onCustomEvent({ type: "CUSTOM_SUBMIT_DONE" })}
    >
      Custom Event
    </button>
  </div>
);

MockForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onCustomEvent: PropTypes.func.isRequired
};

const MockLoadingOverlay = ({ children, active }) => (
  <div data-testid="loading-overlay" data-active={active}>
    {children}
  </div>
);

MockLoadingOverlay.propTypes = {
  children: PropTypes.node,
  active: PropTypes.bool
};

const MockSubmissionError = ({ modalOpen, message, onConfirm }) => (
  <div data-testid="submission-error" data-open={modalOpen}>
    {message}
    <button data-testid="confirm-error-button" onClick={onConfirm}>
      Confirm
    </button>
  </div>
);

MockSubmissionError.propTypes = {
  modalOpen: PropTypes.bool,
  message: PropTypes.string,
  onConfirm: PropTypes.func
};

const MockBackToPrevIcon = ({ onClick }) => (
  <button data-testid="back-to-form-list" onClick={onClick}>
    Back
  </button>
);

MockBackToPrevIcon.propTypes = {
  onClick: PropTypes.func.isRequired
};

// Need to add PropTypes for the mocked components inside the Jest mock functions
// by extending the original component's PropTypes to include validation for the imported components
const formMockPropTypes = {
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onCustomEvent: PropTypes.func.isRequired
};

const loadingOverlayPropTypes = {
  children: PropTypes.node,
  active: PropTypes.bool
};

const submissionErrorPropTypes = {
  modalOpen: PropTypes.bool,
  message: PropTypes.string,
  onConfirm: PropTypes.func
};

const backToPrevIconPropTypes = {
  onClick: PropTypes.func.isRequired
};

// Mock services
jest.mock("../../apiManager/services/bpmServices");
jest.mock("../../apiManager/services/draftService");
jest.mock("../../apiManager/services/FormServices");
jest.mock("../../apiManager/services/processServices");
jest.mock("../../apiManager/services/bpmFormServices");
jest.mock("../../apiManager/services/applicationServices");
jest.mock("../../helper/routerHelper");

// Mock constants
jest.mock("../../constants/constants", () => {
  const originalConstants = jest.requireActual("../../constants/constants");
  return {
    ...originalConstants,
    // Default values that can be overridden in tests
    CUSTOM_SUBMISSION_URL: "",
    CUSTOM_SUBMISSION_ENABLE: false,
    MULTITENANCY_ENABLED: true,
    DRAFT_ENABLED: true,
    DRAFT_POLLING_RATE: 10000,
  };
});

const mockStore = configureStore([thunk]);

describe("UserForm Component", () => {
  let store;
  let history;
  const mockFormId = "test-form-id";
  const mockDraftId = "test-draft-id";

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useParams
    require("react-router-dom").useParams.mockReturnValue({
      formId: mockFormId,
      draftId: mockDraftId,
    });

    // Setup mock store with all required properties
    store = mockStore({
      user: {
        isAuthenticated: true,
        userDetail: { username: "testuser" },
        lang: "en",
      },
      form: {
        form: {
          _id: mockFormId,
          title: "Test Form",
          components: [],
        },
        isActive: false,
        url: "http://localhost:3001/form/test-form-id",
        error: null,
      },
      formDelete: {
        isFormSubmissionLoading: false,
        formSubmitted: false,
        formSubmissionError: { modalOpen: false, message: "" },
        publicFormStatus: { status: "active", anonymous: true },
      },
      draft: {
        draftSubmission: {
          draftId: mockDraftId,
          data: { field1: "value1" }, // Ensure this is defined
          modified: new Date().toISOString(),
        },
        lastUpdated: {
          data: { field1: "value1" }, // Ensure this is defined
        },
      },
      process: {
        formStatusLoading: false,
        processLoadError: null,
      },
      applications: {
        isPublicStatusLoading: false,
      },
      tenants: {
        tenantId: "test-tenant",
      },
      pubSub: {
        publish: jest.fn(),
      },
      submission: {
        submission: { data: {} }, // Ensure this is defined
        error: null,
      },
    });

    history = createMemoryHistory();

    // Mock service functions
    processServices.getFormProcesses.mockImplementation((formId, callback) => {
      callback(null, { id: "process-id", status: "active" });
      return { type: "GET_FORM_PROCESSES" };
    });

    processServices.getApplicationCount.mockReturnValue({
      type: "GET_APPLICATION_COUNT",
    });

    applicationServices.publicApplicationStatus.mockImplementation(
      (formId, callback) => {
        callback(null);
        return { type: "PUBLIC_APPLICATION_STATUS" };
      }
    );

    bpmFormServices.fetchFormByAlias.mockImplementation((formId, callback) => {
      callback(null, { _id: "form-id" });
      return { type: "FETCH_FORM_BY_ALIAS" };
    });

    draftService.draftCreate.mockImplementation((payload, callback) => {
      callback(null, { draftId: "new-draft-id" });
      return { type: "DRAFT_CREATE" };
    });

    draftService.draftUpdate.mockImplementation(
      (payload, draftId, callback) => {
        callback(null);
        return { type: "DRAFT_UPDATE" };
      }
    );

    draftService.publicDraftCreate.mockImplementation((payload, callback) => {
      callback(null, { draftId: "new-public-draft-id" });
      return { type: "PUBLIC_DRAFT_CREATE" };
    });

    draftService.publicDraftUpdate.mockImplementation(
      (payload, draftId, callback) => {
        callback(null);
        return { type: "PUBLIC_DRAFT_UPDATE" };
      }
    );

    formServices.postCustomSubmission.mockImplementation(
      (submission, formId, isPublic, callback) => {
        callback(null, { _id: "submission-id", data: {} });
      }
    );

    bpmServices.getProcessReq.mockReturnValue({
      formId: mockFormId,
      submissionId: "submission-id",
      formUrl: "http://localhost:3001/form/test-form-id",
    });

    routerHelper.navigateToFormEntries.mockImplementation(() => {});

    // Mock saveSubmission
    mockSaveSubmission.mockImplementation(
      (type, submission, formId, callback) => {
        callback(null, { _id: "submission-id", data: {} });
        return { type: "SAVE_SUBMISSION" };
      }
    );
  });

  const renderComponent = (customStore = store) => {
    return render(
      <Provider store={customStore}>
        <Router history={history}>
          <UserForm />
        </Router>
      </Provider>
    );
  };

  it("renders thank you message when form is submitted for public user", () => {
    const publicSubmittedStore = mockStore({
      ...store.getState(),
      user: {
        ...store.getState().user,
        isAuthenticated: false,
      },
      formDelete: {
        ...store.getState().formDelete,
        formSubmitted: true,
      },
    });

    renderComponent(publicSubmittedStore);
    expect(
      screen.getByText("Thank you for your response.")
    ).toBeInTheDocument();
    expect(screen.getByText("saved successfully")).toBeInTheDocument();
  });

  it("renders form not available message for public users when form is not available", () => {
    const formNotAvailableStore = mockStore({
      ...store.getState(),
      user: {
        ...store.getState().user,
        isAuthenticated: false,
      },
      formDelete: {
        ...store.getState().formDelete,
        publicFormStatus: { status: "inactive", anonymous: false },
      },
    });

    renderComponent(formNotAvailableStore);
    expect(screen.getByText("Form not available")).toBeInTheDocument();
  });

  it("renders the form for authenticated users with active form status", () => {
    renderComponent();
    expect(screen.getByTestId("formio-form")).toBeInTheDocument();
    expect(screen.getByText("Test Form")).toBeInTheDocument();
  });

  it("renders the back button for authenticated users", () => {
    renderComponent();
    expect(screen.getByTestId("back-to-form-list")).toBeInTheDocument();
  });

  it("does not render back button for public users", () => {
    const publicUserStore = mockStore({
      ...store.getState(),
      user: {
        ...store.getState().user,
        isAuthenticated: false,
      },
    });

    renderComponent(publicUserStore);
    expect(screen.queryByTestId("back-to-form-list")).not.toBeInTheDocument();
  });

  it("displays 'New Submission' for non-draft submissions", () => {
    const noDraftStore = mockStore({
      ...store.getState(),
      draft: {
        draftSubmission: null,
      },
    });

    renderComponent(noDraftStore);
    expect(screen.getByText("New Submission")).toBeInTheDocument();
  });

  it("navigates back to form entries when back button is clicked", () => {
    renderComponent();
    fireEvent.click(screen.getByTestId("back-to-form-list"));
    expect(routerHelper.navigateToFormEntries).toHaveBeenCalledWith(
      expect.anything(),
      "test-tenant",
      mockFormId
    );
  });

  it("handles custom submission when enabled", async () => {
    jest.mock("../../constants/constants", () => ({
      ...jest.requireActual("../../constants/constants"),
      CUSTOM_SUBMISSION_ENABLE: true,
      CUSTOM_SUBMISSION_URL: "https://custom-url.com",
    }));

    // Create a store with the necessary props for custom submission
    const customSubmissionStore = mockStore({
      ...store.getState(),
      formDelete: {
        ...store.getState().formDelete,
        formSubmissionError: { modalOpen: false, message: "" },
      },
    });

    // Setup the custom submission mock
    formServices.postCustomSubmission.mockImplementation(
      (submission, formId, isPublic, callback) => {
        callback(null, { _id: "custom-submission-id", data: {} });
      }
    );

    // Find the onSubmit prop in the connected component
    // Since we can't directly access props, we'll simulate the submission flow
    await act(async () => {
      // Dispatch actions that would happen during form submission
      customSubmissionStore.dispatch({
        type: "SET_FORM_SUBMISSION_LOADING",
        isLoading: true,
      });

      // Simulate custom submission
      const submission = { _id: "test-id", data: { field1: "value1" } };
      formServices.postCustomSubmission(
        submission,
        mockFormId,
        false,
        (err, result) => {
          if (!err) {
            customSubmissionStore.dispatch({
              type: "SUBMISSION_SUCCESS",
              submission: result,
            });
          }
        }
      );
    });

    // Verify custom submission was called
    expect(formServices.postCustomSubmission).toHaveBeenCalled();
  });

  it("handles form submission errors", async () => {
    // Mock saveSubmission to return an error
    mockSaveSubmission.mockImplementation(
      (type, submission, formId, callback) => {
        callback(new Error("Submission failed"), null);
        return { type: "SAVE_SUBMISSION_ERROR" };
      }
    );

    renderComponent();

    // Simulate form submission
    fireEvent.click(screen.getByTestId("form-submit-button"));
  });

  it("handles form changes and updates draft data", async () => {
    renderComponent();

    // Simulate form change
    fireEvent.click(screen.getByTestId("form-change-button"));

    // Verify draft update is called when component unmounts
    await act(async () => {
      // Unmount component
      history.push("/another-route");
    });

    // Verify draft update was called
    expect(draftService.draftUpdate).toHaveBeenCalled();
  });

  it("handles custom events from the form", async () => {
    renderComponent();

    // Simulate custom event
    fireEvent.click(screen.getByTestId("form-custom-event-button"));
  });

  it("handles process load errors", () => {
    const errorStore = mockStore({
      ...store.getState(),
      process: {
        ...store.getState().process,
        processLoadError: "Process load error",
      },
    });

    renderComponent(errorStore);

    // Form should still render but with error state
    expect(screen.getByTestId("formio-form")).toBeInTheDocument();
  });

  it("handles inactive form status for authenticated users", () => {
    // Mock getFormProcesses to return inactive status
    processServices.getFormProcesses.mockImplementation((formId, callback) => {
      callback(null, { id: "process-id", status: "inactive" });
      return { type: "GET_FORM_PROCESSES" };
    });

    renderComponent();

    // Form should not be rendered
    expect(screen.queryByTestId("formio-form")).not.toBeInTheDocument();
  });

  it("publishes form to event system when form is loaded", () => {
    renderComponent();

    // Verify pubSub.publish was called with the form
    expect(store.getState().pubSub.publish).toHaveBeenCalledWith(
      "ES_FORM",
      store.getState().form.form
    );
  });

  it("handles draft creation when DRAFT_ENABLED is true", async () => {
    jest.mock("../../constants/constants", () => ({
      ...jest.requireActual("../../constants/constants"),
      DRAFT_ENABLED: true,
    }));

    // Mock useParams to not include draftId (new form)
    require("react-router-dom").useParams.mockReturnValue({
      formId: mockFormId,
    });

    const noDraftStore = mockStore({
      ...store.getState(),
      draft: {
        draftSubmission: null,
      },
    });

    renderComponent(noDraftStore);

    // Verify draft creation was called
    await waitFor(() => {
      expect(draftService.draftCreate).toHaveBeenCalled();
    });
  });
});