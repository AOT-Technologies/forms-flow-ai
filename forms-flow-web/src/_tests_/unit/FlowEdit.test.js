import React from 'react';
import { render as rtlRender, screen, waitFor,render,fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from 'react-query';
import rootReducer from './rootReducer';
import { useParams } from "react-router-dom";

import { mockstate } from "./mockState.js";

import FlowEdit from '../../routes/Design/Forms/FlowEdit.js';
import { createMemoryHistory } from 'history';
import { Router, Route, Switch } from 'react-router-dom';
import BpmnEditor from '../../components/Modeler/Editors/BpmnEditor/BpmEditor';

 

    const queryClient = new QueryClient();
    let store = configureStore({
      reducer: rootReducer,
      preloadedState: mockstate,
    });

// Helper function to render the component with router support
function renderWithRouterMatch(Ui, { path = '/', route = '/' ,
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



const defaultProps = {
  isPublished :false, CategoryType:"",
  setWorkflowIsChanged:jest.fn(),workflowIsChanged:false, migration:false, setMigration:jest.fn(), redirectUrl:"",
  isMigrated: true, mapperId:"",layoutNotsaved:false, handleCurrentLayout:jest.fn(),
  isMigrationLoading:false, setIsMigrationLoading:jest.fn(), handleUnpublishAndSaveChanges :jest.fn()
}
// Add this wrapper definition before renderBPMNComponent
const wrapper = ({ children }) => (
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

  // renderWithRouterMatch(FlowEdit, {
  //   path: '/',
  //   route: '/',
  //   props: {
  //     ...defaultProps
  //   }
  // });
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
      // expect(mockMutate).toHaveBeenCalledTimes(1);
    });
  })

   it("render variable button and opens the Variable modal when history button is clicked", ()=>{
    renderWithRouterMatch(FlowEdit, {
      path: '/',
      route: '/',
      props: {
        ...defaultProps
      }
    });
    const variableButton = screen.getByTestId("preview-and-variables-testid")
    expect(variableButton).toBeInTheDocument();
    userEvent.click(variableButton);
    // checks variable modal opens or not 
    waitFor (()=>{
      expect(screen.getByTestId("task-variable-modal")).toBeInTheDocument();
    })
   }) 

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
   })

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
   })

   it("renders save button and enables it when workflowIsChanged is true", async () => {
    // Render and store the return value for rerender
    const { rerender } = renderWithRouterMatch(FlowEdit, {
      path: '/',
      route: '/',
      props: { ...defaultProps },
    });

    
    // Get the save button (initially disabled)
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
  
    // Re-select the button after props update
    const updatedSaveButton = screen.getByTestId('save-flow-layout');
    expect(updatedSaveButton).toBeEnabled(); // Now it should be enabled
  
    // Simulate user clicking the enabled button
    userEvent.click(updatedSaveButton);
  });

   it("should not show migration modal initially", () => {
    renderWithRouterMatch(FlowEdit, { path: '/', route: '/', props: { ...defaultProps } });

    // Migration modal should NOT be in the document initially
    expect(screen.queryByTestId("migration-confirm")).not.toBeInTheDocument();
  });

  it("should show migration modal when migration is triggered", () => {
    const { rerender } = renderWithRouterMatch(FlowEdit, { path: '/', route: '/', props: { ...defaultProps } });

    // Re-render with `isMigrated: false` to trigger migration modal
    rerender(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <Router history={createMemoryHistory({ initialEntries: ['/'] })}>
            <FlowEdit {...defaultProps} isMigrated={false} />
          </Router>
        </Provider>
      </QueryClientProvider>
    );

    // Wait for the modal to appear
     waitFor(() => {
      expect(screen.getByText("Migration Notice")).toBeInTheDocument();
    });

    // // Check if migration checkbox is there
    // const migrationCheckbox = screen.getByTestId("migration-confirm");
    // expect(migrationCheckbox).toBeInTheDocument();
    // expect(migrationCheckbox).not.toBeChecked();

    // // Click the checkbox
    // userEvent.click(migrationCheckbox);
    // expect(migrationCheckbox).toBeChecked();

    // // Check if confirm button gets enabled
    // const confirmButton = screen.getByText("I confirm");
    // expect(confirmButton).toBeInTheDocument();
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
   })

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
    
   })

   it("save button is disabled when process is published", () => {
    renderBPMNComponent({ isPublished:true });
    const saveButton = screen.getByTestId("save-flow-layout");
    expect(saveButton).toBeDisabled();
  });
  
}) 

const wrapperWithMockStoreDraft = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <Provider store={storeDraft}>{children}</Provider>
  </QueryClientProvider>
);

const renderFlowComponentWithDraft = (props = {}) => {
  return render(<FlowEdit {...defaultProps} {...props} />, {
    wrapper: wrapperWithMockStoreDraft,
  });
};




describe("Flowedit page handling publish and save changes",()=>{
  it("handles unpublish and save changes for published forms", async () => {
    const handleUnpublishAndSaveChanges = jest.fn();
    
    const publishedProps = {
      ...defaultProps,
      isPublished: true,
      workflowIsChanged: true,
      handleUnpublishAndSaveChanges
    };
  
    renderWithRouterMatch(FlowEdit, {
      path: '/',
      route: '/',
      props: publishedProps
    });
  
    const saveButton = screen.getByTestId('save-flow-layout');
    await userEvent.click(saveButton);
  
    expect(handleUnpublishAndSaveChanges).toHaveBeenCalled();
  });
})



