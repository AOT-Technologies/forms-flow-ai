import Index from '../../../components/Dashboard/index'
import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux'
import { Router,Route } from 'react-router';
import { createMemoryHistory } from "history";
import StoreService from '../../../services/StoreService';


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

it("Should render the dashboard without breaking",()=>{
    renderWithRouterMatch(Index,{
        path:"/",
        route:"/",
    })
})
