import React from 'react'
import Navbar from '../../containers/NavBar'
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store';
import { Router,Route } from 'react-router';
import { createMemoryHistory } from "history";
import { render as rtlRender,screen } from '@testing-library/react'
import * as redux from 'react-redux' 

let store;
let mockStore = configureStore([]);
beforeEach(()=>{
  store = mockStore({

  });
  store.dispatch = jest.fn();
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

  it("should render Navbar without breaking",()=>{
      const mockstate = {
          user:{
            isAuthenticated:true,
            roles:["formsflow-reviewer"]
          }
      }
      const spy = jest.spyOn(redux,"useSelector");
      spy.mockImplementation((callback) => callback(mockstate)) 
        renderWithRouterMatch(Navbar,{
        path:"/task",
        route:"/task",
    })
    expect(screen.getByText("Forms")).toBeInTheDocument()
    expect(screen.getByText("Dashboards")).toBeInTheDocument()
    
})
