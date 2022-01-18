import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import Index from '../../../components/Admin/index'
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux'
import StoreService from '../../../services/StoreService'
import { Router,Route } from 'react-router';
import { createMemoryHistory } from "history";


const store = StoreService.configureStore();

function renderWithRouterMatch( ui,{ 
    path = "/", 
    route = "/", 
    history = createMemoryHistory({ initialEntries: [route] }) 
  } = {}) { 
    return{ 
    ...rtlRender(  
        <Provider store={store}>
            <Router history={history}> 
                <Route path={path} component={ui} /> 
            </Router>
          </Provider> )
      }
    
  }

it("should render the admin component without breaking",()=>{
    renderWithRouterMatch(Index,{
        path:"/",
        route:"/"
    })
})
