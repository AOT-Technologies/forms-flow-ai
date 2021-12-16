import React from "react";
import '@testing-library/jest-dom/extend-expect';
import { render as rtlRender,fireEvent,screen,waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import StoreService from '../../../services/StoreService'
import { Router ,Route} from 'react-router-dom';
import ViewApplication from "../../../components/Application/ViewApplication";
import { createMemoryHistory } from "history";
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import API from "../../../apiManager/endpoints";
import { replaceUrl } from "../../../helper/helper";


const apiUrlgetApplication = replaceUrl(
    API.GET_APPLICATION,
    "<application_id>",
    100
  );
  const apiUrlgetApplicationError = replaceUrl(
    API.GET_APPLICATION,
    "<application_id>",
    101
  );
export const handlers = [
    rest.get(apiUrlgetApplication, (req, res, ctx) => {
      return res(ctx.status(200),ctx.json({
        applicationName: "Sample Aplication Name",
        applicationStatus: "Sample Application status",
        created: "2021-12-03 04:49:18.813383",
        createdBy: "firstName",
        formId: "0123456",
        formProcessMapperId: "11",
        id: 100,
        modified: "2021-12-03 04:49:19.864880",
        modifiedBy: "sample modified by",
        processInstanceId: "123456789",
        revisionNo: "1",
        submissionId: "123456789"
      }), ctx.delay(150))
    }),
    rest.get(apiUrlgetApplicationError,(req,res,ctx)=>{
      return res(ctx.status(404),ctx.json({"error":"No data found"}))
    })
  ]
  
  const server = setupServer(...handlers)

  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }))

  afterEach(() => server.resetHandlers())

  afterAll(() => server.close())

  const store = StoreService.configureStore();
 
describe("Integration test for the ViewApplication component",()=>{
  
  function renderWithRouterMatch( ui,{ 
    path = "/", 
    route = "/", 
    history = createMemoryHistory({ initialEntries: [route] }) 
  } = {}) { 
    return{ 
    ...rtlRender(  
        <Provider store={store}>
            <Router history={history}> 
                <Route path={path} component={ui} /> 
            </Router>
          </Provider> )
      }
    
  }

  test("it should render the application details",async()=>{
      renderWithRouterMatch(ViewApplication,{
          path :"/application/:applicationId", 
          route :"/application/100",
      })
    expect(await screen.findByText(/firstName/i)).toBeInTheDocument();
    expect(await screen.findByText(/Sample Application status/i)).toBeInTheDocument();
    expect(await screen.findByText(/100/i)).toBeInTheDocument();
    const formLink = screen.getByText("Form");
    fireEvent.click(formLink);
    await waitFor(() => expect(screen.getByTestId("loading-component")).toBeInTheDocument());
    expect(await screen.findByText(/Form/i)).toBeInTheDocument();
    expect(await screen.findByText(/History/i)).toBeInTheDocument();
    expect(await screen.findByText(/Process Diagram/i)).toBeInTheDocument();
  })
  test("it should not render the application details",async()=>{
    renderWithRouterMatch(ViewApplication,{
        path :"/application/:applicationId", 
        route :"/application/101",
    })
  expect(await screen.findByText(/Access Denied/i)).toBeInTheDocument();
 
})
})
