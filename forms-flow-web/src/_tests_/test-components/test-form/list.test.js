import React from 'react'
import { render as rtlRender,screen,fireEvent } from '@testing-library/react'
import List from '../../../components/Form//List'
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store';
import { Router,Route } from 'react-router';
import { createMemoryHistory } from "history";
import * as redux from 'react-redux' 
import {mockstate} from './constants'

let store;
let mockStore = configureStore([]);

function renderWithRouterMatch( Ui,{ 
    path = "/", 
    route = "/", 
    history = createMemoryHistory({ initialEntries: [route] }),
  } = {}) { 
    return{ 
    ...rtlRender(  
        <Provider store={store}>
            <Router history={history}> 
                <Route path={path} component={Ui} />
            </Router>
          </Provider> )
      }
    
  }

beforeEach(()=>{
    store = mockStore(mockstate);
    store.dispatch = jest.fn();

})
it("should render the list component without breaking",()=>{

    const spy = jest.spyOn(redux,"useSelector");
    spy.mockImplementation((callback) => callback(mockstate)) 
    renderWithRouterMatch(List,{
        path:"/form",
        route:"/form"
    } )
   expect(screen.getByText("Test Form 007")).toBeInTheDocument()
   expect(screen.getByText("Create Form")).toBeInTheDocument()
   expect(screen.getByText("Upload Form")).toBeInTheDocument()
   expect(screen.getByText("Download Form")).toBeInTheDocument()
   expect(screen.getByText("items per page")).toBeInTheDocument()
})

it("Should dispatch the file upload hanlder with an empty list when clicking upload button",async()=>{
    const spy = jest.spyOn(redux,"useSelector");
    spy.mockImplementation((callback) => callback(mockstate)) 
    renderWithRouterMatch(List,{
        path:"/form",
        route:"/form"
    } )
    const uploadButton = screen.getByText("Upload Form");
    fireEvent.click(uploadButton);
    expect(store.dispatch).toHaveBeenCalled();
})



it("should go to the form create page when create form button is cliked",async()=>{
    const spy = jest.spyOn(redux,"useSelector");
    spy.mockImplementation((callback) => callback(mockstate)) 
    renderWithRouterMatch(List,{
        path:"/form",
        route:"/form"
    } )
    const createform = screen.getByText("Create Form");
    fireEvent.click(createform);
    expect(store.dispatch).toHaveBeenCalled()
})
