import React from 'react'
import { render as rtlRender,screen,fireEvent } from '@testing-library/react'
import Stepper from '../../../components/Form//Stepper'
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux'
import { Router,Route } from 'react-router';
import { createMemoryHistory } from "history";
import configureStore from 'redux-mock-store';
import {mockstate} from './constants'


let store;
let mockStore = configureStore([]);
beforeEach(()=>{
  store = mockStore({
    mockstate
  });
  store.dispatch = jest.fn();
})

function renderWithRouterMatch( Ui,{ 
    path = "/", 
    route = "/", 
    history = createMemoryHistory({ initialEntries: [route] }),
  } = {}) { 
    return{ 
    ...rtlRender(  
        <Provider store={store}>
            <Router history={history}> 
                <Route path={path} component={Ui} />
            </Router>
          </Provider> )
      }
    
  }

  beforeEach(()=>{
    store = mockStore(mockstate);
    store.dispatch = jest.fn();

})


it("should render the stepper component without break",()=>{
    renderWithRouterMatch(Stepper,{
        path:"/formflow/:formId?/:step?",
        route:"/formflow/create"
    })
    expect(screen.getByText("Design Form")).toBeInTheDocument()
    expect(screen.getByText("Associate this form with a workflow?")).toBeInTheDocument()
    expect(screen.getByText("Preview and Confirm")).toBeInTheDocument()
    expect(screen.getByText("Drag and Drop a form component")).toBeInTheDocument()
    expect(screen.getByText("Create Form")).toBeInTheDocument()
    const savebtn  = screen.getByText("Save & Preview");
    const titleInput = screen.getByLabelText("Title");
    fireEvent.change(titleInput,{
        target:{value:"created by jest"}
    });
})
