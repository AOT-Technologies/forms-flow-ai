import ProcessDiagram from '../../../components/BPMN/ProcessDiagramHook'
import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux'
import { Router,Route } from 'react-router';
import { createMemoryHistory } from "history";
import * as redux from 'react-redux'
import StoreService  from '../../../services/StoreService'
import {initialstate} from './constants'

let store;
beforeEach(()=>{
    store = StoreService.configureStore();
    // store.dispatch = jest.fn();
})

function renderWithRouterMatch( ui,{ 
    path = "/", 
    route = "/", 
    history = createMemoryHistory({ initialEntries: [route] }),
  } = {}) { 
    return{ 
    ...rtlRender(  
        <Provider store={store}>
            <Router history={history}> 
                <Route path={path} component={ui}  /> 
            </Router>
          </Provider> )
      }
    
  }

it("should render the processDiagram component without breaking",async()=>{
    const spy = jest.spyOn(redux,"useSelector");
    spy.mockImplementation((callback) => callback(initialstate))
    renderWithRouterMatch(ProcessDiagram,{
        path:"/",
        route:"/",
    }
    )
    expect(document.getElementById("process-diagram-container")).toBeInTheDocument();
})
