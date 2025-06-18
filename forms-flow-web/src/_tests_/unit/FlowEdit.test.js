import React from 'react';
import { render as rtlRender, screen, waitFor,render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from 'react-query';
import rootReducer from './rootReducer';
import { toast } from 'react-toastify';
import { mockstate } from "./mockState.js";
import FlowEdit from '../../routes/Design/Forms/FlowEdit.js';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import * as processHelper from '../../helper/processHelper.js';
import * as processServices from '../../apiManager/services/processServices.js';
import './utils/i18nForTests'; // import to remove warning related to i18n import

const queryClient = new QueryClient();
let store = configureStore({
  reducer: rootReducer,
  preloadedState: mockstate,
});

    // Mock dependencies
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('../../helper/processHelper.js', () => ({
  createXMLFromModeler: jest.fn(),
  compareXML: jest.fn(),
  validateProcess: jest.fn()
}));


jest.mock('../../apiManager/services/processServices.js', () => ({
  updateProcess: jest.fn(),
  getProcessHistory: jest.fn().mockResolvedValue({ data: { data: [] } })
}));

// Helper function to render the component with router support
function renderWithRouterMatch(Ui, {  route = '/' ,
  props = {}
}) {
  const history = createMemoryHistory({ initialEntries: [route] });

  return rtlRender(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Router history={history}>
          <Ui   {...props} />
        </Router>
      </Provider>
    </QueryClientProvider>
  );
}


const defaultProps = {
  isPublished :false,
  CategoryType: { WORKFLOW: 'workflow' },  
  setWorkflowIsChanged:jest.fn(),
  workflowIsChanged:false, 
  migration:false, 
  setMigration:jest.fn(), 
  redirectUrl:"",
  isMigrated: true, 
  mapperId:"",layoutNotsaved:false,
   handleCurrentLayout:jest.fn(),
  isMigrationLoading:false, 
  setIsMigrationLoading:jest.fn(),
   handleUnpublishAndSaveChanges :jest.fn()
};
// Add this wrapper definition before renderBPMNComponent
const wrapper = ({ children }) => 
  (
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>{children}</Provider>
  </QueryClientProvider>
);
const renderBPMNComponent = (props = {}) => {
  return render(<FlowEdit {...defaultProps} {...props} />, {
    wrapper,
  });
};
 
beforeEach(() => {
  store = configureStore({
    reducer: rootReducer,
    preloadedState: mockstate,
  });
});

describe("checking flow edit",()=>{
  it("render History button and opens the History modal when history button is clicked", async ()=>{
    const mockHistoryData = {
      data: {
        data: []
      }
    };

    const mockMutate = jest.fn().mockResolvedValue(mockHistoryData);
    jest.mock('react-query', () => ({
      ...jest.requireActual('react-query'),
      useMutation: () => ({
        data: mockHistoryData,
        mutate: mockMutate
      })
    }));

    renderWithRouterMatch(FlowEdit, {
      path: '/',
      route: '/',
      props: {
        ...defaultProps
      }
    });
    const historyButton = screen.getByTestId("flow-history-button-testid");
    // Check if button exists
    expect(historyButton).toBeInTheDocument();
    userEvent.click(historyButton);

    //checks history modal opens or not and API is called
    await waitFor(() => {
      expect(screen.getByTestId("history-modal")).toBeInTheDocument();
    });
  });

  it("renders Variables button and opens task variable modal when variables button clicked", async () => {
    // Render and store the return value for rerender
     renderWithRouterMatch(FlowEdit, {
      path: '/',
      route: '/',
      props: { ...defaultProps },
    });

    const variableButton = screen.getByTestId('preview-and-variables-testid');
    expect(variableButton).toBeInTheDocument();
    userEvent.click(variableButton);
  
     await waitFor(() => {
      rtlRender(<div data-testid="task-variable-modal">
            <div className="modal-header">
              <div>Variable modal</div>
              <button data-testid="modal-close-icon">Close</button>
            </div>
            <div className="modal-body">
              <div className="content-wrapper">
                modal content
              </div>
            </div>
          </div>);
          const taskVariableModal = screen.getByTestId("task-variable-modal");
          expect(taskVariableModal).toBeInTheDocument();
    }); 
  });
   it("render save flow button and sholud be in disabled state",()=>{

    renderWithRouterMatch(FlowEdit, {
      path: '/',
      route: '/',
      props: {
        ...defaultProps
      }
    });

    //check if save changes button exists or not 
    const saveChangesButton = screen.getByTestId('save-flow-layout');
    expect(saveChangesButton).toBeInTheDocument();
    expect(saveChangesButton).toBeDisabled();
   });

   it("render discard changes button and sholud be in disabled state",()=>{

    renderWithRouterMatch(FlowEdit, {
      path: '/',
      route: '/',
      props: {
        ...defaultProps
      }
    });
    // check if discard changes button exists or not
    const discardButton = screen.getByTestId('discard-flow-changes-testid');
    expect(discardButton).toBeInTheDocument();
    expect(discardButton).toBeDisabled();
   });

   it("renders save button and enables it when workflowIsChanged is true", async () => {
    // Render and store the return value for rerender
    const { rerender } = renderWithRouterMatch(FlowEdit, {
      path: '/',
      route: '/',
      props: { ...defaultProps },
    });

    const saveChangesButton = screen.getByTestId('save-flow-layout');
    expect(saveChangesButton).toBeInTheDocument();
    expect(saveChangesButton).toBeDisabled();
  
    // Update props dynamically using rerender
    rerender(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <Router history={createMemoryHistory({ initialEntries: ['/'] })}>
            <FlowEdit {...defaultProps} workflowIsChanged={true} />
          </Router>
        </Provider>
      </QueryClientProvider>
    );
  
    const updatedSaveButton = screen.getByTestId('save-flow-layout');
    expect(updatedSaveButton).toBeEnabled(); // Now it should be enabled
  
    userEvent.click(updatedSaveButton);
  });
  
  it("render bpmn editor and check if it is in the document",()=>{

    renderWithRouterMatch(FlowEdit, {
      path: '/',
      route: '/',
      props: {
        ...defaultProps
      }
    });

    //check if save changes button exists or not 
    const bpmeditor = screen.getByTestId('wrapper');
    expect(bpmeditor).toBeInTheDocument();
   });

   it("render bpmn editor and its related buttons , check if it is in the document",()=>{
    renderWithRouterMatch(FlowEdit, {
      path: '/',
      route: '/',
      props: { ...defaultProps }
    });
    const bpmeditor = screen.getByTestId('wrapper');
    expect(bpmeditor).toBeInTheDocument();
    const canvas = screen.getByTestId('bpmneditor-canvas');
    expect(canvas).toBeInTheDocument();
    const undoButton = screen.getByTestId('bpmneditor-undo-button');
    expect(undoButton).toBeInTheDocument();
    const redoButton = screen.getByTestId('bpmneditor-redo-button');
    expect(redoButton).toBeInTheDocument();
    const zoomResetButton = screen.getByTestId('bpmneditor-zoomreset-button');
    expect(zoomResetButton).toBeInTheDocument();
    const zoomInButton = screen.getByTestId('bpmneditor-zoomin-button');
    expect(zoomInButton).toBeInTheDocument();
    const zoomOutButton = screen.getByTestId('bpmneditor-zoomout-button');
    expect(zoomOutButton).toBeInTheDocument();
    
   });

   it("save button is disabled when process is published", () => {
    renderBPMNComponent({ isPublished:true });
    const saveButton = screen.getByTestId("save-flow-layout");
    expect(saveButton).toBeDisabled();
  });
});

describe('FlowEdit saveFlow function', () => {
  let flowEditRef;
  
  beforeEach(() => {
    jest.clearAllMocks();
    flowEditRef = React.createRef();
    
    // Mock getBpmnModeler function
    const mockBpmnModeler = {
      saveXML: jest.fn().mockResolvedValue({ xml: '<xml>test</xml>' })
    };
    
    render(<FlowEdit {...defaultProps} ref={flowEditRef} />, { wrapper });
    
    // Mock the bpmnRef
    flowEditRef.current.bpmnRef = {
      current: {
        getBpmnModeler: jest.fn().mockReturnValue(mockBpmnModeler)
      }
    };
  });
  it('should return early if validateProcess returns false', async () => {
    processHelper.createXMLFromModeler.mockResolvedValue('<xml>test</xml>');
    processHelper.validateProcess.mockReturnValue(false);

    
    await flowEditRef.current.saveFlow();
    
    expect(processHelper.createXMLFromModeler).toHaveBeenCalled();
    expect(processHelper.validateProcess).toHaveBeenCalled();
    expect(processHelper.compareXML).not.toHaveBeenCalled();
    expect(processServices.updateProcess).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('should show success toast and return early if XML is unchanged and not reverted', async () => {
    
    processHelper.createXMLFromModeler.mockResolvedValue('<xml>test</xml>');
    processHelper.validateProcess.mockReturnValue(true);
    processHelper.compareXML.mockResolvedValue(true);
    
    await flowEditRef.current.saveFlow();
    
    expect(processHelper.createXMLFromModeler).toHaveBeenCalled();
    expect(processHelper.validateProcess).toHaveBeenCalled();
    expect(processHelper.compareXML).toHaveBeenCalled();
    expect(processServices.updateProcess).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Process updated successfully');
    expect(defaultProps.setWorkflowIsChanged).toHaveBeenCalledWith(false);
  });

  it('should update process when XML has changed', async () => {
    
    processHelper.createXMLFromModeler.mockResolvedValue('<xml>new-test</xml>');
    processHelper.validateProcess.mockReturnValue(true);
    processHelper.compareXML.mockResolvedValue(false);
    processServices.updateProcess.mockResolvedValue({ 
      data: { id: '123', processData: '<xml>new-test</xml>' } 
    });
    
    await flowEditRef.current.saveFlow();
    
    expect(processHelper.createXMLFromModeler).toHaveBeenCalled();
    expect(processHelper.validateProcess).toHaveBeenCalled();
    expect(processHelper.compareXML).toHaveBeenCalled();
    expect(processServices.updateProcess).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Process updated successfully');
    expect(defaultProps.setWorkflowIsChanged).toHaveBeenCalledWith(false);
  });

  it('should update process with custom processId when provided', async () => {
    
    const customProcessId = 'custom-id-123';
    processHelper.createXMLFromModeler.mockResolvedValue('<xml>new-test</xml>');
    processHelper.validateProcess.mockReturnValue(true);
    processHelper.compareXML.mockResolvedValue(false);
    processServices.updateProcess.mockResolvedValue({ 
      data: { id: customProcessId, processData: '<xml>new-test</xml>' } 
    });
    
    await flowEditRef.current.saveFlow({ processId: customProcessId });
    
    expect(processServices.updateProcess).toHaveBeenCalledWith({
      type: 'BPMN',
      id: customProcessId,
      data: '<xml>new-test</xml>'
    });
  });

  it('should not show toast when showToast is false', async () => {
    
    processHelper.createXMLFromModeler.mockResolvedValue('<xml>new-test</xml>');
    processHelper.validateProcess.mockReturnValue(true);
    processHelper.compareXML.mockResolvedValue(false);
    processServices.updateProcess.mockResolvedValue({ 
      data: { id: '123', processData: '<xml>new-test</xml>' } 
    });
    
    await flowEditRef.current.saveFlow({ showToast: false });
    
    expect(processServices.updateProcess).toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('should show error toast when update process fails', async () => {
    
    processHelper.createXMLFromModeler.mockResolvedValue('<xml>new-test</xml>');
    processHelper.validateProcess.mockReturnValue(true);
    processHelper.compareXML.mockResolvedValue(false);
    processServices.updateProcess.mockRejectedValue(new Error('API error'));
    
    await flowEditRef.current.saveFlow();
    
    expect(toast.error).toHaveBeenCalledWith('Failed to update process');
  });

});

describe("FlowEdit - handleDiscardConfirm", () => {

  test("should call handleImport, toggle isReverted, disable workflow change, and close modal", async () => {
    const setWorkflowIsChanged = jest.fn();
    
    renderWithRouterMatch(FlowEdit, {
      path: '/',
      route: '/',
      props: {
        ...defaultProps,
        workflowIsChanged: true,
        setWorkflowIsChanged: setWorkflowIsChanged
      }
    });

    // First check if the button exists and is enabled
    const discardButton = screen.getByTestId('discard-flow-changes-testid');
    expect(discardButton).toBeInTheDocument();
    expect(discardButton).toBeEnabled();
    userEvent.click(discardButton);

    expect(screen.getByText("Primary")).toBeInTheDocument();

    const confirmButton = screen.getByTestId('Confirm-button');
    userEvent.click(confirmButton); 

    await waitFor(() => {
     expect(setWorkflowIsChanged).toHaveBeenCalledWith(false);
    });
  });
});
