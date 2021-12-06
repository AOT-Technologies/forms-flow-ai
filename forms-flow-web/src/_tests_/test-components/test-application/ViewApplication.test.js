import React from "react";
import '@testing-library/jest-dom/extend-expect';
import { render as rtlRender,fireEvent,screen,waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import StoreService from '../../../services/StoreService'
import {AfterLoadingApplicationDetailt,applicationDetails } from "./Constatnts";
import { Router ,Route} from 'react-router-dom';
import ViewApplication from "../../../components/Application/ViewApplication";
import * as redux from 'react-redux'
import { createMemoryHistory } from "history";
// import {getApplicationById} from '../../../apiManager/services/applicationServices'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import API from "../../../apiManager/endpoints";
import { replaceUrl } from "../../../helper/helper";


const apiUrlgetApplication = replaceUrl(
    API.GET_APPLICATION,
    "<application_id>",
    5487
  );
export const handlers = [
    rest.get(apiUrlgetApplication, (req, res, ctx) => {
      return res(ctx.status(200),ctx.json({
        applicationName: "NCQ",
        applicationStatus: "New",
        created: "2021-12-03 04:49:18.813383",
        createdBy: "sumathi",
        formId: "61a6fc8b5e9ef2746ba7c515",
        formProcessMapperId: "34",
        formUrl: "https://app2.aot-technologies.com/form/61a6fc8b5e9ef2746ba7c515/submission/61a9a1cd69193afa9fd819a6",
        id: 5487,
        modified: "2021-12-03 04:49:19.864880",
        modifiedBy: "service-account-forms-flow-bpm",
        processInstanceId: "5ffc2b46-53f4-11ec-81c8-0242ac170007",
        revisionNo: "1",
        submissionId: "61a9a1cd69193afa9fd819a6"
      }), ctx.delay(150))
    })
  ]
  


  const server = setupServer(...handlers)

  beforeAll(() => server.listen())

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers())

  afterAll(() => server.close())


  const store = StoreService.configureStore();

// const render = Component=>rtlRender(
//     <Provider store={store}>
//         <Router>
//         {Component}
//         </Router>
//     </Provider>
// )

 
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
   
    // const spy = jest.spyOn(redux, 'useSelector');
    // spy.mockReturnValue({applications:AfterLoadingApplicationDetailt} );
    // const useDispatch = jest.spyOn(redux,'useDispatch')
    renderWithRouterMatch(ViewApplication,{
        path :"/application/:applicationId", 
        route :"/application/5487",
    })
    expect(await screen.findByText(/sumathi/i)).toBeInTheDocument();
    expect(await screen.findByText(/New/i)).toBeInTheDocument();
    expect(await screen.findByText(/5487/i)).toBeInTheDocument();
    const formLink = screen.getByText("Form");
    fireEvent.click(formLink);
    await waitFor(() => expect(screen.getByTestId("loading-component")).toBeInTheDocument())
    await waitFor(() => expect(screen.queryAllByText("Print As PDF")));
    // const historyLink = screen.getByText("History");
    // fireEvent.click(historyLink);
    // await waitFor(() => expect(screen.queryAllByText("dfjgjg Histor")))
})
})


