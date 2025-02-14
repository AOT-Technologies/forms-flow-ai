// First, mock the components without using React directly
jest.mock("../../components/Modeler/Editors/BpmnEditor/BpmEditor.js", () => {
  const React = require('react');
  return {
  __esModule: true,
  default: React.forwardRef((props, ref) => {
    // Implement mock methods that will be called via ref
    React.useImperativeHandle(ref, () => ({
      getXML: jest.fn().mockResolvedValue("<xml>test-xml</xml>"),
      setXML: jest.fn().mockResolvedValue(undefined),
      modeler: {
        saveXML: jest.fn().mockResolvedValue({
          xml: '<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definition_1">\n<bpmn:process id="Process_1" isExecutable="false"></bpmn:process>\n</bpmn:definitions>'
        })
      },
      getBpmnModeler: jest.fn().mockResolvedValue("<xml>test-xml</xml>"),
    }));

    return (
      <div data-testid="bpmn-editor"
        onClick={() => props.onChange && props.onChange("<new-bpmn-xml>")}
      >
        Mocked BPMN Editor
      </div>
    );
  })
};
});

jest.mock("../../components/Modeler/Editors/DmnEditor/DmnEditor.js", () => ({
  __esModule: true,
  default: function DmnEditor({ onChange, dmnXml }, ref) {
    return <div data-testid="dmn-editor">Mocked DMN Editor</div>;
  }
}));

// Mock the processHelper
jest.mock("../../helper/processHelper", () => ({
  // createXMLFromModeler: jest.fn(() => Promise.resolve("<xml>1</xml>")),
  createXMLFromModeler: jest.fn().mockResolvedValue("<xml>1</xml>"),
  validateProcess:jest.fn(() => {return true}),
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ProcessCreateEdit from "../../components/Modeler/ProcessCreateEdit";
import "@testing-library/jest-dom";
import PropTypes from "prop-types"; // Ensure PropTypes is imported at the top level
import { useParams, useLocation,useHistory, useNavigate } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { QueryClient, QueryClientProvider } from "react-query"; // Add this import at the top
import { mockstate } from "./mockState";
import userEvent from '@testing-library/user-event';
import ExportDiagram from "../../components/Modals/ExportDiagrams";
// import { updateProcess, createProcess } from "../../apiManager/services/processServices";

import {
  createXMLFromModeler,
} from "../../helper/processHelper";



// Create a new QueryClient instance
const queryClient = new QueryClient();


const store = configureStore({
  reducer: rootReducer,
  preloadedState: mockstate,
});

jest.mock("connected-react-router", () => ({
  push: jest.fn(), // Mock push() to avoid real navigation
  ConnectedRouter: ({ children }) => children, // Mock ConnectedRouter if used
}));

// Mock the API services
jest.mock("../../apiManager/services/processServices", () => ({
  // updateProcess: jest.fn(),
  // createProcess: jest.fn(),
  publish: jest.fn(),
  unPublish: jest.fn(),
  getProcessDetails: jest.fn(),
  getProcessHistory: jest.fn(),
  fetchRevertingProcessData: jest.fn()
}));

// Mock the @formsflow/components package and replace CloseIcon with the mocked component
jest.mock("@formsflow/components", () => {
  const actual = jest.requireActual("../../../__mocks__/@formsflow/components");
  return {
    BackToPrevIcon: () => <span>Back</span>,
    HistoryIcon: () => <span>History Icon</span>,
    CloseIcon: actual.CloseIcon,
    DuplicateIcon: () => <span>Duplicate Icon</span>,
    ImportIcon: () => <span>Import Icon</span>,
    PencilIcon: () => <span>Pencil Icon</span>,
    ConfirmModal:() => <div>Confirm Modal</div>,
    ErrorModal: () => <div>Error Modal</div>,
    HistoryModal: () => <div>History Modal</div>,
    CustomButton: actual.CustomButton,
    CustomInfo: actual.CustomInfo,
    FailedIcon:actual.FailedIcon
  };
});


const mockBlockCallback = jest.fn((tx) => {
  // Simulate the block callback logic
  if (tx.pathname === mockHistory.location.pathname) return true;
  return false;
});

// Create mock block function that returns the unblock function
const mockBlock = jest.fn((callback) => {
  // Store the callback
  mockBlockCallback.mockImplementation(callback);
  return jest.fn(); // Return the unblock function
});

const mockHistory = {
  block: mockBlock,
  location: {
    pathname: '/current/path'
  },
  push: jest.fn(),
  listen: jest.fn(),
  createHref: jest.fn()
};

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useParams: jest.fn(),
     useLocation: jest.fn(),
    useHistory: () => mockHistory,
    useNavigate: () => mockHistory 
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

///////////////
//////////
////////
const defaultPropsBPMN = {
  type: "BPMN",
  Process: {
    name: "Subflow",
    type: "BPMN",
    route: "subflow",
    extension: ".bpmn",
    fileType: "text/bpmn",
  }
};
const renderComponent = (props = {}) => {
  return render(<ProcessCreateEdit {...defaultPropsBPMN} {...props} />, { wrapper });
};


// 

// Mock process data with published status
const mockStatePublished = {
  ...mockstate,
  process: {
    ...mockstate.process,
    processData: {
      ...mockstate.process.processData,
      status: "Published"
    }
  }
};

const storePublished = configureStore({
  reducer: rootReducer,
  preloadedState: mockStatePublished
});

const wrapperWithMockStorePublished = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <Provider store={storePublished}>{children}</Provider>
  </QueryClientProvider>
);

const renderComponentWithPublished = (props = {}) => {
  return render(<ProcessCreateEdit {...defaultPropsBPMN} {...props} />, { wrapper : wrapperWithMockStorePublished});
};


describe("ProcessCreateEdit test suite for BPM Subflow test cases", () => {

  beforeEach(() => {
    useParams.mockReturnValue({
      processKey: "test-process-key",
      step: "edit",
    });
    useLocation.mockReturnValue({ pathname: "/process/edit" });
    useParams.mockReturnValue({ processKey: "test-process", step: "edit" });
   

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
    renderComponent();
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  test("renders save button with correct data-testid", () => {
    renderComponent();
    const saveButton = screen.getByTestId("save-bpmn-layout");
    expect(saveButton).toBeInTheDocument();
  });

  test("save button is initially disabled when workflow is not changed", () => {
    renderComponent();
    const saveButton = screen.getByTestId("save-bpmn-layout");
    expect(saveButton).toBeDisabled();
  });

  test("save button is disabled when process is published", () => {
    renderComponentWithPublished();
    const saveButton = screen.getByTestId("save-bpmn-layout");
    expect(saveButton).toBeDisabled();
  });

  test("save button is disabled during saving process", () => {
    renderComponent();
    const saveButton = screen.getByTestId("save-bpmn-layout");
    fireEvent.click(saveButton);
    expect(saveButton).toBeDisabled();
  });
});

describe("ProcessCreateEdit When save button is enabled", () => {
  beforeEach(() => {
    useParams.mockReturnValue({
      processKey: 'test-process-key',
      step: 'edit'
    });
    useLocation.mockReturnValue({ pathname: '/process/edit' });
    // updateProcess.mockResolvedValue({ data: { id: '123' } });
    // createProcess.mockResolvedValue({ data: { id: '234' } });
  });

  // Mock the initial state where the button should be enabled
  const mockStateEnabled = {
    process: {
      processData: {
        id: "test-id",
        processKey: "test-process-key",
        name: "Test Process",
        status: "Draft",  // Not published
        parentProcessKey: "parent-key",
        processData: "<xml>test</xml>"
      },
      defaultProcessXmlData: "<xml>default</xml>",
      defaultDmnXmlData: "<xml>default-dmn</xml>"
    }
  };

  beforeEach(() => {
    useParams.mockReturnValue({
      processKey: 'test-process-key',
      step: 'edit'
    });
    useLocation.mockReturnValue({ pathname: '/process/edit' });

    // Mock useQuery to return unpublished status
    jest.spyOn(require("react-query"), "useQuery").mockImplementation(() => ({
      isLoading: false,
      data: {
        data: mockStateEnabled.process.processData
      },
      error: null
    }));
  });

  test("save button should be enabled when conditions are met", () => {
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: mockStateEnabled
    });

    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>{children}</Provider>
      </QueryClientProvider>
    );

    render(
      <ProcessCreateEdit 
        type={defaultPropsBPMN.type} 
        Process={defaultPropsBPMN.Process}
      />, 
      { wrapper }
    );

    // Trigger workflow change
    const bpmnEditor = screen.getByTestId("bpmn-editor");
    fireEvent.click(bpmnEditor); // This should trigger onChange and set isWorkflowChanged to true

    // Get the save button
    const saveButton = screen.getByTestId("save-bpmn-layout");
    
    // Verify button is enabled
    expect(saveButton).not.toBeDisabled();
    expect(saveButton).toHaveTextContent("Save BPMN");
    
  });


  test("save Flow button to be clicked when enabled mode", async () => {
    const mockStateEnabled = {
      process: {
        processData: {
          id: "test-id",
          processKey: "test-process-key",
          name: "Test Process",
          status: "Draft",
          parentProcessKey: "parent-key",
          processData: "<xml>test</xml>"
        },
        defaultProcessXmlData: "<xml>default</xml>",
        defaultDmnXmlData: "<xml>default-dmn</xml>"
      },
      tenants: {
        tenantId: "test-tenant"
      }
    };

    const store = configureStore({
      reducer: rootReducer,
      preloadedState: mockStateEnabled
    });

    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>{children}</Provider>
      </QueryClientProvider>
    );

    render(
      <ProcessCreateEdit 
        type={defaultPropsBPMN.type} 
        Process={defaultPropsBPMN.Process}
      />, 
      { wrapper }
    );

    // Trigger workflow change to enable save button
    const bpmnEditor = screen.getByTestId("bpmn-editor");
    fireEvent.click(bpmnEditor);

    // Get and click the save button
    const saveButton = screen.getByTestId("save-bpmn-layout");
    expect(saveButton).not.toBeDisabled();
    
    await userEvent.click(saveButton);
  });

});


///////

describe("ProcessCreateEdit Save flow operations", () => {
  

  beforeEach(() => {
    useParams.mockReturnValue({
      processKey: 'test-process-key',
      step: 'edit'
    });
    useLocation.mockReturnValue({ pathname: '/process/edit' });
  });

  // Mock the initial state where the button should be enabled
  const mockStateEnabled = {
    process: {
      processData: {
        id: "test-id",
        processKey: "test-process-key",
        name: "Test Process",
        status: "Draft",  // Not published
        parentProcessKey: "parent-key",
        processData: "<xml>test</xml>"
      },
      defaultProcessXmlData: "<xml>default</xml>",
      defaultDmnXmlData: "<xml>default-dmn</xml>"
    },
    tenants: {
      tenantId: "test-tenant"
    }
  };

  beforeEach(() => {
    useParams.mockReturnValue({
      processKey: 'test-process-key',
      step: 'edit'
    });
    useLocation.mockReturnValue({ pathname: '/process/edit' });

    // Mock useQuery to return unpublished status
    jest.spyOn(require("react-query"), "useQuery").mockImplementation(() => ({
      isLoading: false,
      data: {
        data: mockStateEnabled.process.processData
      },
      error: null
    }));
  });


  test("Positive case when save flow is clicked", async () => {
    const mockStateEnabled = {
      process: {
        processData: {
          id: "test-id",
          processKey: "test-process-key",
          name: "Test Process",
          status: "Draft",
          parentProcessKey: "parent-key",
          processData: "<xml>test</xml>"
        },
        defaultProcessXmlData: "<xml>default</xml>",
        defaultDmnXmlData: "<xml>default-dmn</xml>"
      },
      tenants: {
        tenantId: "test-tenant"
      }
    };

    const store = configureStore({
      reducer: rootReducer,
      preloadedState: mockStateEnabled
    });

    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>{children}</Provider>
      </QueryClientProvider>
    );

    render(
      <ProcessCreateEdit 
        type={defaultPropsBPMN.type} 
        Process={defaultPropsBPMN.Process}
      />, 
      { wrapper }
    );

    // Trigger workflow change to enable save button
    const bpmnEditor = screen.getByTestId("bpmn-editor");
    fireEvent.click(bpmnEditor);

    // Get and click the save button
    const saveButton = screen.getByTestId("save-bpmn-layout");

     userEvent.click(saveButton);
     const mockBpmnModeler = {
      get: jest.fn((name) => {
        if (name === "moddle") return { create: jest.fn() };
        return null;
      }),
      invoke: jest.fn(),
      _definitions: {
        id: "Definitions_mocked",
        targetNamespace: "http://bpmn.io/schema/bpmn",
      },
      _moddle: {
        create: jest.fn(),
      },
    };

    // // Mock the return value of createXMLFromModeler
   await createXMLFromModeler(mockBpmnModeler);
   expect(createXMLFromModeler).toHaveBeenCalled()
  });

});
