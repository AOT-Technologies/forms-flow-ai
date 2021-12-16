import Dashboard from '../../../components/Dashboard/Dashboard'
import React from 'react'
import { render as rtlRender,screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux'
import { Router,Route } from 'react-router';
import { createMemoryHistory } from "history";
import StoreService from '../../../services/StoreService';
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

it("Should render the dashboard without breaking",()=>{
    const spy = jest.spyOn(redux,"useSelector");
    spy.mockImplementation((callback) => callback({
        metrics:{
            submissionsList:[
                {
                    "count": 26,
                    "mapperId": 22,
                    "formName": "New Business License Application"
                },
                {
                    "count": 29,
                    "mapperId": 23,
                    "formName": "Freedom of Information and Protection of Privacy"
                },
            ],
            submissionsStatusList:[
                {
                    "statusName": "Approved",
                    "count": 1,
                    "applicationName": "New Business License Application"
                },
                {
                    "statusName": "New",
                    "count": 21,
                    "applicationName": "New Business License Application"
                },
            ],
            isMetricsLoading:false,
            isMetricsStatusLoading:false,
            selectedMetricsId:22,
            metricsLoadError:false,
            metricsStatusLoadError:false
        }
    }));
    renderWithRouterMatch(Dashboard,{
        path:"/",
        route:"/",
    })
    expect(screen.getByText("Metrics")).toBeInTheDocument();
    expect(screen.getByText("Submissions")).toBeInTheDocument();
    expect(screen.getByText("New Business License Application")).toBeInTheDocument();
    expect(screen.getByText("Freedom of Information and Protection of Privacy")).toBeInTheDocument();
})



it("Should not render the dashboard in case of error",()=>{
    const spy = jest.spyOn(redux,"useSelector");
    spy.mockImplementation((callback) => callback({
        metrics:{
            submissionsList:[
            ],
            submissionsStatusList:[
               
            ],
            isMetricsLoading:false,
            isMetricsStatusLoading:false,
            selectedMetricsId:22,
            metricsLoadError:true,
            metricsStatusLoadError:false
        }
    }));
    renderWithRouterMatch(Dashboard,{
        path:"/",
        route:"/",
    })
    expect(screen.getByText("The operation couldn't be completed. Please try after sometime")).toBeInTheDocument();
})
