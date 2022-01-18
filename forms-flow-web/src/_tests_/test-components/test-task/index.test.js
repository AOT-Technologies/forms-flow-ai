import Index from '../../../components/Task/index'
import React from 'react'
import { render as rtlRender,screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux'
import { Router,Route } from 'react-router';
import { createMemoryHistory } from "history";
import configureStore from 'redux-mock-store';
import {mockstatetasks,bpmTasks} from './constants'

let store;
let mockStore = configureStore([]);

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

it("should render the task index component without breaking",async()=>{
    store = mockStore(mockstatetasks);
      store.dispatch = jest.fn();
    renderWithRouterMatch(Index,{
        path:"/task",
        route:"/task",
    }
    )
    expect(screen.getByTestId("loading-component")).toBeInTheDocument();
})
it("should render the task index component without breaking",async()=>{
    store = mockStore(bpmTasks);
      store.dispatch = jest.fn();
    renderWithRouterMatch(Index,{
        path:"/task",
        route:"/task",
    }
    )
  expect(screen.getByText("Review Submission")).toBeInTheDocument();
})
