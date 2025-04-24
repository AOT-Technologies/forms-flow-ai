jest.mock("../../apiManager/services/processServices", () => {
  const actual = jest.requireActual(
    "../../apiManager/services/processServices"
  );
  return {
    ...actual,
    createProcess: jest.fn((args) => {
      console.log("Mocked createProcess called with:", args);
      return Promise.resolve({ data: { id: 1, name: "Test Process" } });
    }),
    updateProcess: jest.fn().mockResolvedValue({ data: {} }),
    publish: jest.fn(() => actual.publish()),
    unPublish: jest.fn(() => actual.unPublish()),
    getProcessDetails: jest.fn().mockResolvedValue({ data: {} }),
    getProcessHistory: jest.fn(() => actual.getProcessHistory()),
    fetchRevertingProcessData: jest.fn(() =>
      actual.fetchRevertingProcessData()
    ),
  };
});

jest.mock("../../components/Modeler/Editors/BpmnEditor/BpmEditor.js", () => {
  const React = require("react");
  const PropTypes = require("prop-types");

  const MockedBpmEditor = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      getXML: jest.fn().mockResolvedValue("<xml>test-xml</xml>"),
      setXML: jest.fn().mockResolvedValue(undefined),
      modeler: {
        saveXML: jest.fn().mockResolvedValue({
          xml: '<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definition_1">\n<bpmn:process id="Process_1" isExecutable="false"></bpmn:process>\n</bpmn:definitions>',
        }),
      },
      getBpmnModeler: jest.fn().mockResolvedValue("<xml>test-xml</xml>"),
      handleImport: jest.fn(),
    }));

    return (
      <button
        data-testid="bpmn-editor"
        tabIndex={0}
        onClick={() => props.onChange && props.onChange("<new-bpmn-xml>")}
        onKeyPress={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            props.onChange && props.onChange("<new-bpmn-xml>");
          }
        }}
      >
        Mocked BPMN Editor
      </button>
    );
  });

  // Add PropTypes validation
  MockedBpmEditor.propTypes = {
    onChange: PropTypes.func.isRequired, // Validate onChange as a required function
  };

  return {
    __esModule: true,
    default: MockedBpmEditor,
  };
});


jest.mock("../../helper/processHelper", () => {
  const actual = jest.requireActual("../../helper/processHelper");
  return {
    validateProcess: () => actual.validateProcess,
    validateDecisionNames: () => {
      return true;
    },
    compareXML: () => {
      return true;
    },
    // createXMLFromModeler: jest.fn(() => Promise.resolve("<xml>1</xml>")),
    createXMLFromModeler: () => {
      return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_49a3inm" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="5.0.0" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.17.0">
  <bpmn:process id="Processyy_nm9ewcsAAQQQ" name="AAA12y3" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="AAA">
      <bpmn:outgoing>Flow_1cawbcg</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Activity_0fngdxtAA" name="tygub">
      <bpmn:incoming>Flow_1cawbcg</bpmn:incoming>
      <bpmn:outgoing>Flow_1jdbs66</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_1cawbcg" name="AAA" sourceRef="StartEvent_1"
     targetRef="Activity_0fngdxtAA" />
    <bpmn:endEvent id="Event_0g5jxoy" name="AAA">
      <bpmn:incoming>Flow_1jdbs66</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1jdbs66" sourceRef="Activity_0fngdxtAA" targetRef="Event_0g5jxoy" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Processyy_nm9ewcsAAQQQ">
      <bpmndi:BPMNShape id="Activity_0fngdxt_di" bpmnElement="Activity_0fngdxtAA">
        <dc:Bounds x="480" y="160" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0g5jxoy_di" bpmnElement="Event_0g5jxoy">
        <dc:Bounds x="752" y="142" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="759" y="185" width="22" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="142" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="186" y="185" width="23" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1cawbcg_di" bpmnElement="Flow_1cawbcg">
        <di:waypoint x="215" y="160" />
        <di:waypoint x="348" y="160" />
        <di:waypoint x="348" y="200" />
        <di:waypoint x="480" y="200" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="404" y="182" width="23" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1jdbs66_di" bpmnElement="Flow_1jdbs66">
        <di:waypoint x="580" y="200" />
        <di:waypoint x="666" y="200" />
        <di:waypoint x="666" y="160" />
        <di:waypoint x="752" y="160" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;
    },
  };
});

// jest.mock("@formsflow/service", () => {
//   const actual = jest.requireActual("@formsflow/service"); // Get actual module

//   return {
//     ...actual, // Preserve all other methods
//     RequestService:{
//       httpPOSTRequest: () => Promise.resolve(jest.fn(() => ({ data: {} })))
//     }};
// });

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  ...jest.requireActual("react-toastify"),
}));

jest.mock("react-i18next", () => ({
  ...jest.requireActual("react-i18next"),
}));

jest.mock("../../components/CustomComponents/NavigateBlocker", () => {
  return function MockedNavigateBlocker() {
    return null; // Render nothing
  };
});

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ProcessCreateEdit from "../../routes/Design/Process/ProcessCreateEdit";
import "@testing-library/jest-dom";
import { useParams } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { QueryClient, QueryClientProvider } from "react-query"; // Add this import at the top
import { mockstate } from "./mockState";
import userEvent from "@testing-library/user-event";
import './utils/i18nForTests'; // import to remove warning related to i18n import
const queryClient = new QueryClient();
const store = configureStore({
  reducer: rootReducer,
  preloadedState: mockstate,
});

jest.mock("connected-react-router", () => ({
  push: jest.fn(), // Mock push() to avoid real navigation
  ConnectedRouter: ({ children }) => children, // Mock ConnectedRouter if used
}));

jest.mock("../../actions/processActions", () => ({
  setProcessData: jest.fn().mockImplementation((data) => (dispatch) => {
    // Mock implementation
    dispatch({
      type: "SET_PROCESS_DATA",
      payload: data,
    });
  }),
  setProcessDiagramXML: jest.fn(),
}));

jest.mock("@formsflow/components", () => {
  const actual = jest.requireActual("../../../__mocks__/@formsflow/components");
  return {
    ...actual,
    BackToPrevIcon: () => <span>Back</span>,
    HistoryIcon: () => <span>History Icon</span>,
    DuplicateIcon: () => <span>Duplicate Icon</span>,
    ImportIcon: () => <span>Import Icon</span>,
    PencilIcon: () => <span>Pencil Icon</span>,
    ErrorModal: () => <div>Error Modal</div>,
    HistoryModal: () => <div>History Modal</div>,
    CustomButton: actual.CustomButton,
    CustomInfo: actual.CustomInfo,
    FailedIcon: actual.FailedIcon,
    InfoIcon: actual.InfoIcon,
  };
});

// Mock process data with unpublished status
const mockStateDraft = {
  ...mockstate,
  process: {
    ...mockstate.process,
    processData: {
      ...mockstate.process.processData,
      status: "Draft",
    },
  },
};

// Mock process data with published status
const mockStatePublished = {
  ...mockstate,
  process: {
    ...mockstate.process,
    processData: {
      ...mockstate.process.processData,
      status: "Published",
    },
  },
};

beforeEach(() => {
  jest.spyOn(require("react-query"), "useQuery").mockImplementation(() => ({
    isLoading: false,
    data: {
      data: mockStatePublished.process.processData,
    },
    error: null,
  }));
  useDispatch.mockReturnValue(jest.fn());
});


const mockHistory = {
  block: jest.fn(),
  location: {
    pathname: "/current/path",
  },
  push: jest.fn(),
  listen: jest.fn(),
  createHref: jest.fn(),
};

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useParams: jest.fn(() => {
      return { processKey: "test-process-key", step: "create" };
    }),
    useLocation: jest.fn(),
    useHistory: () => mockHistory,
    useNavigate: () => mockHistory,
  };
});

// Add this polyfill before the tests
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function (str, newStr) {
    return this.replace(
      new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      newStr
    );
  };
}

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>{children}</Provider>
  </QueryClientProvider>
);

const defaultPropsBPMN = {
  type: "BPMN",
  Process: {
    name: "Subflow",
    type: "BPMN",
    route: "subflow",
    extension: ".bpmn",
    fileType: "text/bpmn",
  },
};
const renderBPMNComponent = (props = {}) => {
  return render(<ProcessCreateEdit {...defaultPropsBPMN} {...props} />, {
    wrapper,
  });
};

const storePublished = configureStore({
  reducer: rootReducer,
  preloadedState: mockStatePublished,
});

const wrapperWithMockStorePublished = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <Provider store={storePublished}>{children}</Provider>
  </QueryClientProvider>
);

const renderBPMNComponentWithPublished = (props = {}) => {
  return render(<ProcessCreateEdit {...defaultPropsBPMN} {...props} />, {
    wrapper: wrapperWithMockStorePublished,
  });
};

const storeDraft = configureStore({
  reducer: rootReducer,
  preloadedState: mockStateDraft,
});

const wrapperWithMockStoreDraft = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <Provider store={storeDraft}>{children}</Provider>
  </QueryClientProvider>
);

const renderBPMNComponentWithDraft = (props = {}) => {
  return render(<ProcessCreateEdit {...defaultPropsBPMN} {...props} />, {
    wrapper: wrapperWithMockStoreDraft,
  });
};

describe("ProcessCreateEdit test suite for BPM Subflow test cases", () => {
  beforeEach(() => {
    useParams.mockReturnValue({
      processKey: "test-process-key",
      step: "edit",
    });
  });

  test("displays Draft status when process is not published", () => {
    renderBPMNComponent();
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  test("renders save button with correct data-testid", () => {
    renderBPMNComponent();
    const saveButton = screen.getByTestId("save-bpmn-layout");
    expect(saveButton).toBeInTheDocument();
  });

  test("save button is initially disabled when workflow is not changed", () => {
    renderBPMNComponent();
    const saveButton = screen.getByTestId("save-bpmn-layout");
    expect(saveButton).toBeDisabled();
  });

  test("save button is disabled when process is published", () => {
    renderBPMNComponentWithPublished();
    const saveButton = screen.getByTestId("save-bpmn-layout");
    expect(saveButton).toBeDisabled();
  });

  test("save button is disabled during saving process", () => {
    renderBPMNComponent();
    const saveButton = screen.getByTestId("save-bpmn-layout");
    fireEvent.click(saveButton);
    expect(saveButton).toBeDisabled();
  });
});

describe("ProcessCreateEdit When save button is enabled", () => {
  beforeEach(() => {
    useParams.mockReturnValue({
      processKey: "test-process-key",
      step: "edit",
    });
  });

  test("save button should be enabled and flow to be saved on CREATE mode", async () => {
    renderBPMNComponentWithDraft();
    const bpmnEditor = screen.getByTestId("bpmn-editor");
    fireEvent.click(bpmnEditor); // This should trigger onChange and set isWorkflowChanged to true
    const saveButton = screen.getByTestId("save-bpmn-layout");
    expect(saveButton).not.toBeDisabled();
    expect(saveButton).toHaveTextContent("Save BPMN");

    await userEvent.click(saveButton);
  });
});

describe("ProcessCreateEdit Save flow operations on process CREATE", () => {
  beforeEach(() => {
    useParams.mockReturnValue({
      processKey: "test-process-key",
      step: "create",
    });
  });

  test("save button should be enabled and flow to be saved on CREATE mode", async () => {
    renderBPMNComponentWithDraft();
    const bpmnEditor = screen.getByTestId("bpmn-editor");
    fireEvent.click(bpmnEditor); // This should trigger onChange and set isWorkflowChanged to true
    const saveButton = screen.getByTestId("save-bpmn-layout");
    expect(saveButton).not.toBeDisabled();
    expect(saveButton).toHaveTextContent("Save BPMN");
    await userEvent.click(saveButton);
  });
});

describe("Check process PUBLISH button click", () => {

  beforeEach(() => {
    useParams.mockReturnValue({
      processKey: "test-process-key",
      step: "create",
    });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clears all mock calls and instances
    jest.restoreAllMocks(); // Restores original implementations of spied methods
  });

  test('should call getModalContent with modalType "publish" and CREATE mode', async () => {
    renderBPMNComponentWithDraft();
    const bpmnEditor = screen.getByTestId("bpmn-editor");
    fireEvent.click(bpmnEditor); // This should trigger onChange and set isWorkflowChanged to true
    const publishBtn = screen.getByTestId("handle-publish-testid");
    fireEvent.click(publishBtn);
    const confirmModalActionBtn = screen.getByTestId("Confirm-button");
    expect(confirmModalActionBtn).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(confirmModalActionBtn);
    });
  });

  test('should call getModalContent with modalType "publish" and EDIT mode', async () => {
    useParams.mockReturnValue({
      processKey: "test-process-key",
      step: "edit",
    });
    renderBPMNComponentWithDraft();

    const bpmnEditor = screen.getByTestId("bpmn-editor");
    fireEvent.click(bpmnEditor);
    const publishBtn = screen.getByTestId("handle-publish-testid");
    expect(publishBtn).toBeInTheDocument();
    fireEvent.click(publishBtn);
    const confirmModalActionBtn = screen.getByTestId("Confirm-button");
    expect(confirmModalActionBtn).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(confirmModalActionBtn);
    });
  });
});

describe("Check process UNPUBLISH button click", () => {
  beforeEach(() => {
    useParams.mockReturnValue({
      processKey: "test-process-key",
      step: "edit",
    });
    useDispatch.mockReturnValue(jest.fn());
  });

  test('should call "unpublish" button in and EDIT mode', async () => {
    renderBPMNComponentWithPublished();

    const bpmnEditor = screen.getByTestId("bpmn-editor");
    fireEvent.click(bpmnEditor); // This should trigger onChange and set isWorkflowChanged to true
    const publishBtn = screen.getByTestId("handle-unpublish-testid");
    expect(publishBtn).toBeInTheDocument();
    fireEvent.click(publishBtn);
    const confirmModalActionBtn = screen.getByTestId("Confirm-button");
    expect(confirmModalActionBtn).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(confirmModalActionBtn);
    });
  });
});

describe("History modal working in process ", () => {
  beforeEach(() => {
    useParams.mockReturnValue({
      processKey: "test-process-key",
      step: "create",
    });
  });
  test("should not show history button on CREATE mode", async () => {
    renderBPMNComponent();
    const historyBtn = screen.queryByTestId("bpmn-history-button-testid");
    expect(historyBtn).not.toBeInTheDocument();
  });

  test("should show history button on EDIT mode", async () => {
    useParams.mockReturnValue({
      processKey: "test-process-key",
      step: "edit",
    });
    renderBPMNComponent();
    const historyBtn = screen.queryByTestId("bpmn-history-button-testid");
    expect(historyBtn).toBeInTheDocument();
  });

  test("should click history button and open on EDIT mode", async () => {
    useParams.mockReturnValue({
      processKey: "test-process-key",
      step: "edit",
    });
    renderBPMNComponent();
    const historyBtn = screen.queryByTestId("bpmn-history-button-testid");
    expect(historyBtn).toBeInTheDocument();
    await userEvent.click(historyBtn);
  });
});

describe("Check process Discard Changes button click", () => {
  beforeEach(() => {
    useParams.mockReturnValue({
      processKey: "test-process-key",
      step: "create",
    });
  });

  test('should call modalType "discard" and CREATE mode', async () => {
    renderBPMNComponent();

    const bpmnEditor = screen.getByTestId("bpmn-editor");
    fireEvent.click(bpmnEditor);
    const discardBtn = screen.getByTestId("discard-bpmn-changes-testid");
    fireEvent.click(discardBtn);
    const confirmModalActionBtn = screen.getByTestId("Confirm-button");
    expect(confirmModalActionBtn).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(confirmModalActionBtn);
    });
  });
});

describe("Action modal working in process ", () => {
  beforeEach(() => {
    useParams.mockReturnValue({
      processKey: "test-process-key",
      step: "edit",
    });
  });
  test("should show action button on CREATE mode", async () => {
    useParams.mockReturnValue({
      processKey: "test-process-key",
      step: "create",
    });
    renderBPMNComponent();
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
    renderBPMNComponent();
    await commonActionModalOpenStep();
  });

  test("should click action button and open on EDIT mode and perform close modal", async () => {
    renderBPMNComponent();
    await commonActionModalOpenStep();
    const actionModalCloseBtn = screen.getByTestId("action-modal-close");
    expect(actionModalCloseBtn).toBeInTheDocument();
    await userEvent.click(actionModalCloseBtn);
  });

  test("should perform DUPLICATE btn click from ACTION modal", async () => {
    renderBPMNComponent();
    await commonActionModalOpenStep();
    const duplicateBtn = screen.getByTestId("duplicate-workflow-button");
    expect(duplicateBtn).toBeInTheDocument();
    await userEvent.click(duplicateBtn);
  });

  test("should perform IMPORT btn click from ACTION modal", async () => {
    renderBPMNComponent();
    await commonActionModalOpenStep();
    const importBtn = screen.getByTestId("import-workflow-button");
    expect(importBtn).toBeInTheDocument();
    await userEvent.click(importBtn);
  });

  test("should perform EXPORT btn click from ACTION modal", async () => {
    renderBPMNComponent();
    await commonActionModalOpenStep();
    const exportBtn = screen.getByTestId("export-workflow-button");
    expect(exportBtn).toBeInTheDocument();
    await userEvent.click(exportBtn);
  });
});
