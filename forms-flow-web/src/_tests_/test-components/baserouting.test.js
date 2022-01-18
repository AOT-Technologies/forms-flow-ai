import React from 'react'
import { render as rtlRender,screen } from '@testing-library/react'
import BaseRouting from '../../../src/components/BaseRouting'
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux'
import { Router,Route } from 'react-router';
import { createMemoryHistory } from "history";
import configureStore from 'redux-mock-store';

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

it("should render the Baserouting component without breaking",async()=>{
    store = mockStore({
        user:{
            isAuthenticated:true,
            roles:[
                "formsflow-client"
            ]
        }
      });
      store.dispatch = jest.fn();
    renderWithRouterMatch(BaseRouting,{
        path:"/",
        route:"/",
    }
    )
  expect(screen.getByText("Forms")).toBeInTheDocument()
})


it("should not render the Baserouting component without authenticating breaking",async()=>{
    store = mockStore({
        user:{
            isAuthenticated:false,
            roles:[]
        }
      });
      store.dispatch = jest.fn();
    renderWithRouterMatch(BaseRouting,{
        path:"/",
        route:"/",
    }
    )
  expect(screen.queryByText("Forms")).not.toBeInTheDocument()
})
