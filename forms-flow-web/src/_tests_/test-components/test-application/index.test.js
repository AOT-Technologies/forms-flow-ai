import React from "react";
import '@testing-library/jest-dom/extend-expect';
import { render as rtlRender } from '@testing-library/react'
import Index from "../../../components/Application/index";
import { Router ,Route} from 'react-router-dom';
import { createMemoryHistory } from "history";
import { Provider } from 'react-redux'
import StoreService from '../../../services/StoreService'

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

describe("Should render the exact componnent based on the route given",()=>{
    test("should render the index without crashing",async()=>{
    renderWithRouterMatch(Index,{
            route:'/',
            path:'/'
        })    
    })
})
