import React from 'react'
import { render as rtlRender,screen } from '@testing-library/react'
import Index from '../../../components/Form/index'
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux'
import StoreService from '../../../services/StoreService'
import { Router,Route } from 'react-router';
import { createMemoryHistory } from "history";
import * as redux from 'react-redux';


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

it("should render the Form Index component without breaking",()=>{
   const spy = jest.spyOn(redux,"useSelector");
   spy.mockReturnValue({user:{isAuthenticated:true}})
    renderWithRouterMatch(Index,{
        path:"/",
        route:"/",
    }
    )
    expect(screen.getByTestId("Form-index")).toBeInTheDocument();
})
it("should render the loading component without breaking when not authenticated",()=>{
     renderWithRouterMatch(Index,{
         path:"/",
         route:"/",
     }
     )
     expect(screen.getByTestId("loading-component")).toBeInTheDocument();
 })

it("should render the Form list component without breaking",()=>{
    const spy = jest.spyOn(redux,"useSelector");
    spy.mockImplementation((callback) => callback({
       
        bpmForms:{
            isActive:false,
            forms:[
                {
                    "_id": "sample",
                    "title": "sample",
                    "processKey": "sample"
                }
            ],
            pagination:{
                "numPages": 0,
                "page": 1,
                "total": 0
            }
        },
        user:{
            isAuthenticated:true
        },
        formCheckList:{
            formList:[]
        },
        process:{
            isApplicationCountLoading:false,
            formProcessList:[]
        },
        formCheckList:{
            formUploadFormList:[]
        },
        forms:{
           query: {type: 'form', tags: 'common', title__regex: ''},
           sort:"title"
        },
        user:{
            roles:['']
        }
    }));
     renderWithRouterMatch(Index,{
         path:"/form",
         route:"/form",
     }
     )
    // expect(screen.getByTestId("sample")).toBeInTheDocument() 
    // expect(screen.getByText("Operations")).toBeInTheDocument()
    // expect(screen.getByText("Form")).toBeInTheDocument()
 })

 it("should render the Stepper component without breaking",()=>{
    const spy = jest.spyOn(redux,"useSelector");
    spy.mockImplementation((callback) => callback({
        user:{
            isAuthenticated:true,
            roles:   ["formsflow-designer"]
        },
     
    }))  
     renderWithRouterMatch(Index,{
        path:"/formflow/:formId?/:step?",
         route:"/formflow/123/1",
     }
     )
     expect(screen.getByText("Design Form")).toBeInTheDocument();
     expect(screen.getByText("Associate this form with a workflow?")).toBeInTheDocument();
     expect(screen.getByText("Preview and Confirm")).toBeInTheDocument();

 })

 it("should redirect to home component without breaking",()=>{
    const spy = jest.spyOn(redux,"useSelector");
    spy.mockImplementation((callback) => callback({
        user:{
            isAuthenticated:true,
            roles:   []
        },
     
    }))  
     renderWithRouterMatch(Index,{
        path:"/formflow/:formId?/:step?",
         route:"/formflow/123/1",
     }
     )
     expect(screen.queryByText("Design Form")).not.toBeInTheDocument();
     expect(screen.queryByText("Associate this form with a workflow?")).not.toBeInTheDocument();
     expect(screen.queryByText("Preview and Confirm")).not.toBeInTheDocument();
 })

 it("should render the item -> View component without breaking",()=>{
    const spy = jest.spyOn(redux,"useSelector");
    spy.mockImplementation((callback) => callback({
        user:{
            isAuthenticated:true,
            roles:   ["formsflow-reviewer"],
        },
        formDelete:{
            isFormSubmissionLoading:true
        },
        applications:{
            isPublicStatusLoading:true
        }

    }))  
     renderWithRouterMatch(Index,{
        path:"/form/:formId",
         route:"/form/123",
     }
     )
    expect(screen.getByTestId("Form-index")).toBeInTheDocument();
 })

 it("should redirect to base url  without breaking",()=>{
    const spy = jest.spyOn(redux,"useSelector");
    spy.mockImplementation((callback) => callback({
        user:{
            isAuthenticated:true,
            roles:   [],
        },
        formDelete:{
            isFormSubmissionLoading:true
        }
    }))  
     renderWithRouterMatch(Index,{
        path:"/form/:formId",
         route:"/form/123",
     }
     )
    expect(screen.queryByTestId("Form-index")).not.toBeInTheDocument();
 })
 