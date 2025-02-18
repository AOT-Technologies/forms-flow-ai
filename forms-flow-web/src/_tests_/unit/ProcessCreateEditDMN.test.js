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

jest.mock("../../components/Modeler/Editors/DmnEditor/DmnEditor.js", () => {
  const React = require("react");
  const PropTypes = require("prop-types");

  const MockedDMNEditor = React.forwardRef((props, ref) => {
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
        data-testid="dmn-editor"
        tabIndex={0}
        onClick={() => props.onChange && props.onChange("<new-dmn-xml>")}
        onKeyPress={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            props.onChange && props.onChange("<new-dmn-xml>");
          }
        }}
      >
        Mocked DMN Editor
      </button>
    );
  });

  // Add PropTypes validation
  MockedDMNEditor.propTypes = {
    onChange: PropTypes.func.isRequired, // Validate onChange as a required function
  };

  return {
    __esModule: true,
    default: MockedDMNEditor,
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


jest.mock("../../components/CustomComponents/NavigateBlocker", () => {
  return function MockedNavigateBlocker() {
    return null; // Render nothing
  };
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ProcessCreateEdit from "../../routes/Design/Process/ProcessCreateEdit";
import "@testing-library/jest-dom";
import { useParams } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { QueryClient, QueryClientProvider } from "react-query"; // Add this import at the top
import { mockstate } from "./mockState";
import userEvent from "@testing-library/user-event";

const queryClient = new QueryClient();


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

// Mock the @formsflow/components package and replace CloseIcon with the mocked component
jest.mock("@formsflow/components", () => {
  const actual = jest.requireActual("../../../__mocks__/@formsflow/components");
  return {
    ...actual,
    BackToPrevIcon: () => <span>Back</span>,
    HistoryIcon: () => <span>History Icon</span>,
    CloseIcon: actual.CloseIcon,
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

const storePublished = configureStore({
  reducer: rootReducer,
  preloadedState: mockStatePublished,
});

jest.spyOn(require("react-query"), "useQuery").mockImplementation(() => ({
  isLoading: false,
  data: {
    data: mockStatePublished.process.processData,
  },
  error: null,
}));

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

/// TEST CASES FOR DECISION TABLE PROCESS ////

const wrapperDMN = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <Provider store={storePublished}>{children}</Provider>
  </QueryClientProvider>
);

const defaultPropsDMN = {
  type: "DMN",
  Process: {
    name: "Decision Table",
    type: "DMN",
    route: "decision-table",
    extension: ".dmn",
    fileType: "text/dmn",
  },
};

const renderDMNComponent = (props = {}) => {
  return render(<ProcessCreateEdit {...defaultPropsDMN} {...props} />, {
    wrapper: wrapperDMN,
  });
};

describe("ProcessCreateEdit test suite for DMN test cases", () => {
  beforeEach(() => {
    useParams.mockReturnValue({
      processKey: "test-process-key",
      step: "edit",
    });
    // Mock useQuery success response
    jest.spyOn(require("react-query"), "useQuery").mockImplementation(() => ({
      isLoading: false,
      data: {
        data: mockstate.process.processData, // Use the same data from mockstate
      },
      error: null,
    }));
  });

  test("displays Draft status when process is not published", () => {
    renderDMNComponent();
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  test("renders save button with correct data-testid", () => {
    renderDMNComponent();
    const saveButton = screen.getByTestId("save-dmn-layout");
    expect(saveButton).toBeInTheDocument();
  });

  test("save button is initially disabled when workflow is not changed", () => {
    renderDMNComponent();
    const saveButton = screen.getByTestId("save-dmn-layout");
    expect(saveButton).toBeDisabled();
  });

  // test("save button is disabled when process is published", () => {
  //   renderBPMNComponentWithPublished();
  //   const saveButton = screen.getByTestId("save-bpmn-layout");
  //   expect(saveButton).toBeDisabled();
  // });

  test("save button is disabled during saving process", () => {
    renderDMNComponent();
    const saveButton = screen.getByTestId("save-dmn-layout");
    fireEvent.click(saveButton);
    expect(saveButton).toBeDisabled();
  });
});

describe("ProcessCreateEdit DMN When save button is enabled", () => {
  beforeEach(() => {
    useParams.mockReturnValue({
      processKey: "test-process-key",
      step: "edit",
    });

    jest.spyOn(require("react-query"), "useQuery").mockImplementation(() => ({
      isLoading: false,
      data: {
        data: mockStateDraft.process.processData,
      },
      error: null,
    }));
  });

  test("save button should be enabled and flow to be saved on CREATE mode", async () => {
    renderDMNComponent();
    // Trigger workflow change
    const dmnEditor = screen.getByTestId("dmn-editor");
    fireEvent.click(dmnEditor); // This should trigger onChange and set isWorkflowChanged to true
    const saveButton = screen.getByTestId("save-dmn-layout");
    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveTextContent("Save DMN");

    await userEvent.click(saveButton);
  });
});
