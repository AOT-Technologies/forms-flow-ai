import React from 'react'
import { render as rtlRender,screen } from '@testing-library/react'
import View from '../../../../components/Form/Item/View'
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux'
import { Router,Route } from 'react-router';
import { createMemoryHistory } from "history";
import configureStore from 'redux-mock-store';
import { mockstate } from './constatnts-edit';
import thunk from 'redux-thunk'
import * as redux from 'react-redux' 

jest.mock('react-formio', () => ({
  ...jest.requireActual('react-formio'),
}));

const middlewares = [thunk] 
let store;
let mockStore = configureStore(middlewares);

beforeEach(()=>{
  store = mockStore(mockstate);
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

it("should render the View component without breaking",async()=>{
  const spy = jest.spyOn(redux,"useSelector");
  spy.mockImplementation((callback) => callback(
    {applications:{isPublicStatusLoading:false},form:{isActive: false},formDelete:{isFormSubmissionLoading:false}}
))
    renderWithRouterMatch(View,{
        path:"/form/:formId",
        route:"/form/123",
    }
    )
  expect(screen.getByText("the form title")).toBeInTheDocument();
  expect(screen.getByText("Submit")).toBeInTheDocument();  
})

it("should render the public View component without breaking ",async()=>{
  const spy = jest.spyOn(redux,"useSelector");
  spy.mockImplementation((callback) => callback(
    {applications:{isPublicStatusLoading:false},form:{isActive: false},formDelete:{isFormSubmissionLoading:false}}
))
  //spy.mockReturnValue({applications:{isPublicStatusLoading:false},form:{isActive: false}})
  renderWithRouterMatch(View,{
      path:"/public/form/:formId",
      route:"/public/form/123",
  }
  )
expect(screen.getByText("the form title")).toBeInTheDocument();
expect(screen.getByText("Submit")).toBeInTheDocument();  
})
