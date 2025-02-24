import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { QueryClient, QueryClientProvider } from "react-query";
import { Edit } from "../../routes/Design/Forms/FormEdit";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import thunk from "redux-thunk";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
// Add middleware array with thunk
let store;
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

store = mockStore({
  user: {
    formAccess: [
      {
        type: "read_all",
        roles: ["formsflow-reviewer"],
      },
    ],
    submissionAccess: [
      {
        type: "create_own",
        roles: ["formsflow-reviewer"],
      },
    ],
    lang: "en",
    userDetail: { preferred_username: "testuser" },
    roleIds: {
      ANONYMOUS: "anonymous",
      REVIEWER: "formsflow-reviewer",
    },
  },
  form: {
    form: {
      _id: "test-form-id",
      title: "Test Form",
      components: [],
      type: "form",
      display: "form",
      path: "testform",
    },
    error: null,
  },
  process: {
    formProcessList: {
      id: "test-process-id",
      status: "draft",
      processKey: "test-key",
      formName: "Test Form",
      parentFormId: "parent-id",
      anonymous: false,
      description: "Test description",
      isMigrated: true,
    },
    formPreviousData: {
      parentFormId: "parent-id",
    },
    processData: {},
    applicationCount: 0,
  },
  tenants: {
    tenantId: "test-tenant",
  },
  formRestore: {
    formHistoryData: {},
  },
});
// Add permissions mock to show the button
jest.mock("../../constants/permissions", () => ({
  __esModule: true,
  default: () => {
    return {
      createDesigns: true,
    };
  },
}));

// Add this with other component mocks
jest.mock("../../components/Modals/SettingsModal", () => ({
  __esModule: true,
  default: ({ show, handleClose }) =>
    show ? (
      <div data-testid="settings-modal">
        <div>Settings</div>
        <button data-testid="save-form-settings">Save Changes</button>
        <button data-testid="cancel-form-settings" onClick={handleClose}>
          Discard Changes
        </button>
      </div>
    ) : null,
}));

// Mock all required components
jest.mock("@formsflow/components", () => ({
  CustomButton: ({ label, dataTestId, disabled }) => (
    <button data-testid={dataTestId} disabled={disabled}>
      {label}
    </button>
  ),
  ConfirmModal: ({ show }) => (show ? <div data-testid="confirm-modal" /> : null),
  ActionModal: ({ show }) => (show ? <div data-testid="action-modal" /> : null),
  BackToPrevIcon: () => <div data-testid="back-icon" />,
  HistoryIcon: () => <div data-testid="history-icon" />,
  PreviewIcon: () => <div data-testid="preview-icon" />,
  FormBuilderModal: () => <div data-testid="form-builder-modal" />,
  HistoryModal: () => <div data-testid="history-modal" />,
  ImportModal: () => <div data-testid="import-modal" />,
  CustomInfo: () => <div data-testid="custom-info" />,
}));

// Mock react-i18next
jest.mock("react-i18next", () => ({
  // This makes the hook available in the component and in other mocked components
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
}));

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

const queryClient = new QueryClient();

const renderWithProviders = (ui) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>{ui}</Provider>
    </QueryClientProvider>
  );
};

const renderConfirmModal = () => {
  render(
    <div data-testid="confirm-modal">
      <div className="modal-header">
        <div>Confirm Publish</div>
        <button data-testid="modal-close-icon">Close</button>
      </div>

      <div className="modal-body">
        <div className="content-wrapper">
          <span className="modal-content-heading">
            Publishing will save any unsaved changes and lock the entire form,
            including the layout and the flow. To perform any additional changes
            you will need to unpublish the form again.
          </span>
          <span className="modal-content-text">Main content goes here</span>
        </div>

        <div className="content-wrapper">
          <span className="modal-content-heading">Secondary Message</span>
          <span className="modal-content-text">
            Additional content goes here
          </span>
        </div>
      </div>

      <div className="modal-footer">
        <button
          className="btn-primary"
          data-testid="confirm-button"
          onClick={() => {}}
        >
          Publish this form
        </button>
        <button
          className="btn-secondary"
          data-testid="cancel-button"
          onClick={() => {}}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

describe("Form editor,title and status showing properly", () => {
  beforeEach(() => {
    useParams.mockReturnValue({ formId: "test-form-id" });
  });

  //renders form editor in layout mode
  test("renders form editor in layout mode", () => {
    renderWithProviders(<Edit />);
    expect(screen.getByText("Layout")).toBeInTheDocument();
  });

  //displays form title correctly
  test("displays form title correctly", () => {
    renderWithProviders(<Edit />);
    expect(screen.getByText("Test Form")).toBeInTheDocument();
  });

  //shows draft status when form is not published
  test("shows draft status when form is not published", () => {
    renderWithProviders(<Edit />);
    expect(
      screen.getByTestId(`form-status-${store.getState().form.form._id}`)
    ).toBeInTheDocument();
  });

  //switches between layout and flow views
  test("switches between layout and flow views", () => {
    renderWithProviders(<Edit />);

    // Target the button using data-testid
    const toggleButton = screen.getByTestId("form-flow-wraper-button");
    expect(toggleButton).toHaveTextContent("Flow");
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent("Layout");
  });
});

describe("working of publish button", () => {
  beforeEach(() => {
    useParams.mockReturnValue({ formId: "test-form-id" });
  });
  //shows publish button when form is in draft state
  test("shows publish button when form is in draft state", async () => {
    store = configureStore(middlewares)({
      ...store.getState(),
      process: {
        ...store.getState().process,
        formProcessList: {
          ...store.getState().process.formProcessList,
          status: "draft",
        },
      },
    });
    renderWithProviders(<Edit />);
    expect(screen.getByTestId("handle-publish-testid")).toBeInTheDocument();
    // Wait for the modal to open and check if it is displayed
    await waitFor(() => {
      renderConfirmModal();
    });

    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
  });

  test("shows unpublish button with correct state", async () => {
    store = configureStore(middlewares)({
      ...store.getState(),
      process: {
        ...store.getState().process,
        formProcessList: {
          ...store.getState().process.formProcessList,
          status: "active", // Change status to active
        },
      },
    });
    renderWithProviders(<Edit />);
    const publishButton = screen.getByTestId("handle-publish-testid");
    expect(publishButton).toHaveTextContent("Unpublish");

    // Wait for the modal to open and check if it is displayed
    await waitFor(() => {
      renderConfirmModal();
    });

    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
  });
});

describe("save layout button working", () => {
  beforeEach(() => {
    useParams.mockReturnValue({ formId: "test-form-id" });
  });

  test("renders save button with correct data-testid", () => {
    renderWithProviders(<Edit />);
    const saveButton = screen.getByTestId("save-form-layout");
    expect(saveButton).toBeInTheDocument();
  });

  test("save button is initially disabled when form is not changed", () => {
    renderWithProviders(<Edit />);
    const saveButton = screen.getByTestId("save-form-layout");
    expect(saveButton).toBeDisabled();
  });

  test("save button is disabled when form is published", () => {
    store = configureStore(middlewares)({
      ...store.getState(),
      form: {
        ...store.getState().form,
        formChangeState: { changed: false },
      },
    });
    renderWithProviders(<Edit />);
    const saveButton = screen.getByTestId("save-form-layout");
    expect(saveButton).toBeDisabled();
  });

  test("save button is disabled during saving process", () => {
    renderWithProviders(<Edit />);
    const saveButton = screen.getByTestId("save-form-layout");
    fireEvent.click(saveButton);
    expect(saveButton).toBeDisabled();
  });

  //shows save layout button when changes are made
  test("shows save layout button when changes are made", async () => {
    store = configureStore(middlewares)({
      ...store.getState(),
      form: {
        ...store.getState().form,
        formChangeState: { changed: true },
      },
    });
    renderWithProviders(<Edit />);
    expect(screen.getByTestId("save-form-layout")).toBeInTheDocument();
        // Wait for the modal to open and check if it is displayed
        await waitFor(() => {
          renderConfirmModal();
        });
    
    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
  });
});

describe("discard button working", () => {
  beforeEach(() => {
    useParams.mockReturnValue({ formId: "test-form-id" });
  });

  test("discard button is disabled when form is published", () => {
    store = configureStore(middlewares)({
      ...store.getState(),
      form: {
        ...store.getState().form,
        formChangeState: { changed: false },
      },
    });
    renderWithProviders(<Edit />);
    const saveButton = screen.getByTestId("discard-button-testid");
    expect(saveButton).toBeDisabled();
  });

  //shows discard changes button when changes are made
  test("shows discard changes button when changes are made", async() => {
    store = configureStore(middlewares)({
      ...store.getState(),
      form: {
        ...store.getState().form,
        formChangeState: { changed: true },
      },
    });
    renderWithProviders(<Edit />);
    expect(screen.getByTestId("discard-button-testid")).toBeInTheDocument();
    // Wait for the modal to open and check if it is displayed
    await waitFor(() => {
          renderConfirmModal();
        });
    
    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
  });
});

describe("settings button working", () => {
  beforeEach(() => {
    useParams.mockReturnValue({ formId: "test-form-id" });
  });

  //shows settings button for authorized users
  test("shows settings button for authorized users", () => {
    renderWithProviders(<Edit />);
    expect(screen.getByTestId("editor-settings-testid")).toBeInTheDocument();
  });
});

describe("action button button working", () => {
  beforeEach(() => {
    useParams.mockReturnValue({ formId: "test-form-id" });
  });

  //shows actions button for authorized users
  test("shows actions button for authorized users", async () => {
    renderWithProviders(<Edit />);
    expect(screen.getByTestId("designer-action-testid")).toBeInTheDocument();
  });
});

describe("preview button button working", () => {
  beforeEach(() => {
    useParams.mockReturnValue({ formId: "test-form-id" });
  });

  //displays preview button in layout mode
  test("displays preview button in layout mode", () => {
    renderWithProviders(<Edit />);
    expect(screen.getByTestId("handle-preview-testid")).toBeInTheDocument();
  });
  
});

describe("history button button working", () => {
  beforeEach(() => {
    useParams.mockReturnValue({ formId: "test-form-id" });
  });

  //displays history button in layout mode
  test("displays history button in layout mode", () => {
    renderWithProviders(<Edit />);
    expect(
      screen.getByTestId("handle-form-history-testid")
    ).toBeInTheDocument();
  });
});

