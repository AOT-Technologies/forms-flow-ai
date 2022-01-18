import ViewTask from '../../../components/Task/ViewTask'
import React from 'react'
import { render as rtlRender,screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux'
import { Router,Route } from 'react-router';
import { createMemoryHistory } from "history";
import * as redux from 'react-redux'
import StoreService  from '../../../services/StoreService'
let store;
beforeEach(()=>{
    store = StoreService.configureStore()
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

it("should render zero tasks message when task list is empty",async()=>{

    const spy = jest.spyOn(redux,"useSelector");
    spy.mockImplementation((callback) => callback({tasks:{
        taskDetail:{
            "id": "123",
            "name": "Review Submission",
            "assignee": null,
            "created": "2021-12-13T07:10:36.808+0000",
            "due": null,
            "followUp": null,
            "delegationState": null,
            "description": null,
            "executionId": "c4ef1799-5be3-11ec-b3b9-0242ac190008",
            "owner": null,
            "parentTaskId": null,
            "priority": 50,
            "processDefinitionId": "onestepapproval:1:17ff87a1-29e3-11ec-8349-0242ac1d0007",
            "processInstanceId": "c4ef1799-5be3-11ec-b3b9-0242ac190008",
            "taskDefinitionKey": "reviewer",
            "caseExecutionId": null,
            "caseInstanceId": null,
            "caseDefinitionId": null,
            "suspended": false,
            "formKey": null,
            "tenantId": null,
            "applicationStatus": "New",
            "formName": "Freedom of Information and Protection of Privacy",
            "submissionDate": "2021-12-13 07:10:36.053783",
            "submitterName": "nancy-smith",
            "applicationId": 5533
        },
        isLoading:false
    },
    applications:{
        applicationProcess:{}
    },
    user:{
        "roles": [
            "formsflow-reviewer"
        ],
        "userDetail": {
            "email_verified": false,
            "role": [
                "formsflow-reviewer"
            ],
            "name": "random name",
        },
        "isAuthenticated": true,
        "currentPage": "",
        "showApplications": true,
        "showViewSubmissions": true
    },
    formDelete:{
        formSubmissionError:''
    },
    process:{
        isProcessLoading:false
    }

})) 
        renderWithRouterMatch(ViewTask,{
        path:"/task/:taskId",
        route:"/task/123",
    }
    )
   expect(screen.getByText("Form")).toBeInTheDocument()
   expect(screen.getByText("Application History")).toBeInTheDocument()
   expect(screen.getByText("Process Diagram")).toBeInTheDocument()
})
