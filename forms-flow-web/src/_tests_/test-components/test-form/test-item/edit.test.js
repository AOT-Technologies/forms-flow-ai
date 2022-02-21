import React from 'react'
import { render as rtlRender,screen,fireEvent } from '@testing-library/react'
import Edit from '../../../../components/Form/Item/Edit'
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux'
import { Router,Route } from 'react-router';
import { createMemoryHistory } from "history";
import configureStore from 'redux-mock-store';
import { mockstate } from './constatnts-edit';
import thunk from 'redux-thunk'
import {
  saveForm,
  
} from "react-formio";

jest.mock('react-formio', () => ({
  ...jest.requireActual('react-formio'),
  saveForm: jest.fn(),
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

it("should render the Edit component without breaking",async()=>{
    renderWithRouterMatch(Edit,{
        path:"/formflow/:formId/edit",
        route:"/formflow/123/edit",
    }
    )
   expect(screen.getByText("the form title")).toBeInTheDocument();
   expect(screen.getByText("Save Form")).toBeInTheDocument();
   const savebtn  = screen.getByText("Save Form");
   fireEvent.click(savebtn);
  expect(saveForm).toHaveBeenCalled()
})
