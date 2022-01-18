import List from '../../../components/Task/List'
import React from 'react'
import { render as rtlRender,screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux'
import { Router,Route } from 'react-router';
import { createMemoryHistory } from "history";
import configureStore from 'redux-mock-store';
import {ZeroTasks} from './constants'

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

it("should render zero tasks message when task list is empty",async()=>{
    store = mockStore(ZeroTasks);
      store.dispatch = jest.fn();
    renderWithRouterMatch(List,{
        path:"/task",
        route:"/task",
    }
    )
    expect(screen.getByText("No tasks found")).toBeInTheDocument();
})
