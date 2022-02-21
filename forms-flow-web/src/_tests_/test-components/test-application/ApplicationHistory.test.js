import React from "react";
import '@testing-library/jest-dom/extend-expect';
import { render as rtlRender,screen,waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import StoreService from '../../../services/StoreService'
import HistoryList from "../../../components/Application/ApplicationHistory";
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import API from "../../../apiManager/endpoints";
import { replaceUrl } from "../../../helper/helper";

let store ;

var render = Component=>rtlRender(
    <Provider store={store}>
        {Component}
    </Provider>
)

beforeEach(()=>{
    store = StoreService.configureStore();
})

const apiUrlAppHistory = replaceUrl(
    API.GET_APPLICATION_HISTORY_API,
    "<application_id>",
    100
  );
const apiUrlAppHistoryError = replaceUrl(
API.GET_APPLICATION_HISTORY_API,
"<application_id>",
101
);
const apiUrlAppHistoryEmpty = replaceUrl(
    API.GET_APPLICATION_HISTORY_API,
    "<application_id>",
    102
    );

const mockAPI = jest.fn();

export const handlers = [
    rest.get(apiUrlAppHistory, (req, res, ctx) => {
        mockAPI()
      return res(ctx.status(200),ctx.json({
        applications:[
            {
                applicationStatus: "New",
                created: "2021-10-11 06:59:23.433982",
                formUrl: ""
            }
        ]
      }), ctx.delay(150))
    }),
    rest.get(apiUrlAppHistoryError,(req,res,ctx)=>{
      return res(ctx.status(404),ctx.json({"error":"No data found"}))
    }),
    rest.get(apiUrlAppHistoryEmpty,(req,res,ctx)=>{
        return res(ctx.status(200),ctx.json({applications:[]}))
    })
  ]
  
  const server = setupServer(...handlers)

  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }))

  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

describe("Integration test for HistoryList component",()=>{
    test("Should render the history list table when the valid props are passed",async()=>{
        render(<HistoryList applicationId={100} />)
        await waitFor(()=>expect(mockAPI).toHaveBeenCalledTimes(1))
    })
    test("Should not render the history list table when the invalid props are passed",async()=>{
        render(<HistoryList applicationId={101} />)
        await waitFor(() => expect(screen.queryByText("New")).not.toBeInTheDocument());
        await waitFor(() => expect(screen.queryByText("View Submission")).not.toBeInTheDocument());
        await waitFor(() => expect(screen.getByText("No Application History found")).toBeInTheDocument());
    })
    test("Should not render the history list table when no props are passed",async()=>{
        render(<HistoryList  />)
        await waitFor(() => expect(screen.getByText("No Application History found")).toBeInTheDocument());
    })
    test("Should display no data message when historyList is empty",async()=>{
        render(<HistoryList applicationId={102} />)
        await waitFor(() => expect(screen.getByText("No Application History found")).toBeInTheDocument());
    })
})