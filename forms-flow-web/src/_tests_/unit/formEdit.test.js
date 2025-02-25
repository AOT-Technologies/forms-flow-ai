import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
} from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { QueryClient, QueryClientProvider } from "react-query";
import { Edit } from "../../routes/Design/Forms/FormEdit";
import { useParams } from "react-router-dom";
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

jest.mock("@formsflow/components", () => {
  const actual = jest.requireActual("../../../__mocks__/@formsflow/components");
  return {
    ...actual,
    BackToPrevIcon: () => <div data-testid="back-icon" />,
    HistoryIcon: () => <div data-testid="history-icon" />,
    PreviewIcon: () => <div data-testid="preview-icon" />,
    FormBuilderModal: () => <div data-testid="form-builder-modal" />,
    HistoryModal: () => <div data-testid="history-modal" />,
    ImportModal: () => <div data-testid="import-modal" />,
    DuplicateIcon: () => <span>Duplicate Icon</span>,
    ImportIcon: () => <span>Import Icon</span>,
    PencilIcon: () => <span>Pencil Icon</span>,
    ErrorModal: () => <div>Error Modal</div>,
    CustomButton: actual.CustomButton,
    CustomInfo: actual.CustomInfo,
    FailedIcon: actual.FailedIcon,
    InfoIcon: actual.InfoIcon,
  };
});
// Mock all required components

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
  test("shows publish button when form is in draft state", () => {
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
    const publishBtn = screen.getByTestId("handle-publish-testid");
    expect(publishBtn).toBeInTheDocument();
    fireEvent.click(publishBtn);
  });

  test("shows unpublish button with correct state", () => {
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
    fireEvent.click(publishButton);
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
  test("shows save layout button when changes are made", () => {
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
  test("shows discard changes button when changes are made", async () => {
    store = configureStore(middlewares)({
      ...store.getState(),
      form: {
        ...store.getState().form,
        formChangeState: { changed: true },
      },
    });
    renderWithProviders(<Edit />);
    const discardBtn = screen.getByTestId("discard-button-testid");
    fireEvent.click(discardBtn);
    const confirmModalActionBtn = screen.getByTestId("Confirm-button");
    expect(confirmModalActionBtn).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(confirmModalActionBtn);
    });
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

describe("action button working", () => {
  beforeEach(() => {
    useParams.mockReturnValue({ formId: "test-form-id" });
  });

  //shows actions button for authorized users
  test("should show action button on CREATE mode", async () => {
    renderWithProviders(<Edit />);
    const actionBtn = screen.queryByTestId("designer-action-testid");
    expect(actionBtn).toBeInTheDocument();
  });

  const commonActionModalOpenStep = async () => {
    const actionBtn = screen.queryByTestId("designer-action-testid");
    expect(actionBtn).toBeInTheDocument();
    await userEvent.click(actionBtn);
    const actionModal = screen.queryByTestId("action-modal");
    expect(actionModal).toBeInTheDocument();
  };

  test("should show action button on EDIT mode", async () => {
    renderWithProviders(<Edit />);
    await commonActionModalOpenStep();
  });

  test("should click action button and open on EDIT mode and perform close modal", async () => {
    renderWithProviders(<Edit />);
    await commonActionModalOpenStep();
    const actionModalCloseBtn = screen.getByTestId("action-modal-close");
    expect(actionModalCloseBtn).toBeInTheDocument();
    await userEvent.click(actionModalCloseBtn);
  });

  test("should perform DUPLICATE btn click from ACTION modal", async () => {
    renderWithProviders(<Edit />);
    await commonActionModalOpenStep();
    const duplicateBtn = screen.getByTestId("duplicate-form-button");
    expect(duplicateBtn).toBeInTheDocument();
    await userEvent.click(duplicateBtn);
  });

  test("should perform IMPORT btn click from ACTION modal", async () => {
    renderWithProviders(<Edit />);
    await commonActionModalOpenStep();
    const importBtn = screen.getByTestId("import-form-button");
    expect(importBtn).toBeInTheDocument();
    await userEvent.click(importBtn);
  });
});

describe("preview button functionality", () => {
  beforeEach(() => {
    useParams.mockReturnValue({ formId: "test-form-id" });
    window.open = jest.fn();
  });

  test("displays preview button in layout mode", () => {
    renderWithProviders(<Edit />);
    expect(screen.getByTestId("handle-preview-testid")).toBeInTheDocument();
  });

  test("redirects to preview page when clicked", () => {
    renderWithProviders(<Edit />); 

    const previewButton = screen.getByTestId("handle-preview-testid");
    fireEvent.click(previewButton);

    expect(window.open).toHaveBeenCalledWith(
      "/formflow/test-form-id/view-edit",
      "_blank"
    );
  });
});

describe("history button working", () => {
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
