import Index from '../../../components/ServiceFlow/index'
import React from 'react'
import { render as rtlRender,screen } from '@testing-library/react'
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

it("should render the serviceflow index component without breaking",async()=>{
    const spy = jest.spyOn(redux,"useSelector");
    spy.mockImplementation((callback) => callback(initialstate))
    renderWithRouterMatch(Index,{
        path:"/task",
        route:"/task",
    }
    )
    expect(screen.getByText("assignee_name_1")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Diagram")).toBeInTheDocument();
    expect(screen.getByText("Form")).toBeInTheDocument();
    expect(screen.getByText("Claim")).toBeInTheDocument();
    expect(screen.getByText("Set follow-up Date")).toBeInTheDocument();
    expect(screen.getByText("Set Due date")).toBeInTheDocument();
    expect(screen.getAllByText("Review Submission")).toHaveLength(2);

})
