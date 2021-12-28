import React from "react";
import { render as rtlRender,screen } from '@testing-library/react'
import {ApplicationList} from "../../../components/Application/List";
import { Provider } from 'react-redux'
import StoreService from '../../../services/StoreService'
import '@testing-library/jest-dom/extend-expect';
import { Loadingstate,AfterLoadingWithresult,AfterLoadingWithoutresult,initialState } from "./Constants";
import { BrowserRouter as Router } from 'react-router-dom';
import * as redux from 'react-redux'


const store = StoreService.configureStore();

const render = Component=>rtlRender(
    <Provider store={store}>
        <Router>
        {Component}
        </Router>
    </Provider>
)


test("Should render No Applications Found when initial state is passed",()=>{
    const spy = jest.spyOn(redux,"useSelector");
    spy.mockImplementation((callback) => callback({
        applications:initialState,
        user:{
            roles:["formsflow-designer"]
        }
    }))
    render(<ApplicationList  />);
    expect(screen.getByText(/No Applications Found/i)).toBeInTheDocument();
})

test("Should render Loading state when loading state variable is truthy",()=>{
    const spy = jest.spyOn(redux,"useSelector");
    spy.mockImplementation((callback) => callback({
        applications:Loadingstate,
        user:{
            roles:["formsflow-designer"]
        }
    }))
    render(<ApplicationList />);
    expect(screen.getByTestId(/loading-component/i)).toBeInTheDocument();
})
test("Should render the table with the data after data fetch is over with results",()=>{
    const spy = jest.spyOn(redux,"useSelector");
    spy.mockImplementation((callback) => callback({
        applications:AfterLoadingWithresult,
        user:{
            roles:["formsflow-designer"]
        }
    }))
    render(<ApplicationList  />);
    expect(screen.getByText(/Applications/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Application ID/i).length).toBe(2);
    expect(screen.getAllByText(/Application Name/i).length).toBe(2);
    expect(screen.getByText("5434")).toBeInTheDocument();
    expect(screen.getAllByText(/Sample Form/i).length).toBe(3);
    expect(screen.getByText(/Showing 1 to 3 of 3 Results/i)).toBeInTheDocument();
    
})

test("Should render No results found when providing a filter value which is not in db",async()=>{
    const spy = jest.spyOn(redux,"useSelector");
    spy.mockImplementation((callback) => callback({
        applications:AfterLoadingWithoutresult,
        user:{
            roles:["formsflow-designer"]
        }
    }))
    const statespy = jest.spyOn(React,"useState");
    statespy.mockImplementationOnce(() => React.useState({filtermode:true}))  
    render(<ApplicationList  />);
    expect(screen.getAllByText(/Applications/i).length).toBe(3);
    expect(screen.queryByText('Please change the selected filters to view applications')).toBeInTheDocument();
})
