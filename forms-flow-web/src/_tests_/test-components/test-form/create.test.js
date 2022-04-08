import React from 'react'
import { render as rtlRender,screen,fireEvent } from '@testing-library/react'
import Create from '../../../components/Form/Create'
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux'
import { Router,Route } from 'react-router';
import { createMemoryHistory } from "history";
import configureStore from 'redux-mock-store';
import * as redux from 'react-redux' 

let store;
let mockStore = configureStore([]);
beforeEach(()=>{
  store = mockStore({
    form:{
      error:""
    },
    
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

  

it("should render the create component without braking",()=>{

  const spy = jest.spyOn(redux,"useSelector");
  spy.mockImplementation((callback) => callback(
    {user:{lang:''},form:{error:""}}
))
    renderWithRouterMatch(Create,{
        path:"/formflow/:formId",
        route:"/formflow/create",
    }
    )
    expect(screen.getByText("Save & Preview")).toBeInTheDocument();
})

it("should render the create  anonymous component without braking",()=>{

  const spy = jest.spyOn(redux,"useSelector");
  spy.mockImplementation((callback) => callback(
    {user:{lang:''},form:{error:""}}
))
  renderWithRouterMatch(Create,{
      path:"/formflow/:formId",
      route:"/formflow/create",
  }
  )
  const anonymous = screen.getByTestId("anonymous")
  expect(screen.getByTestId("anonymous")).toBeInTheDocument();
  fireEvent.click(anonymous)
  expect(anonymous.checked).toEqual(true)
  fireEvent.click(anonymous)
  expect(anonymous.checked).toEqual(false)
})
