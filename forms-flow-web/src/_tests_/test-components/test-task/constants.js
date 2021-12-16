export const mockstatetasks = {
   tasks: {
        isLoading: true,
        tasksList: [],
        tasksCount: 0,
        taskDetail: {},
        isTaskUpdating: false,
        appHistory: [],
        isHistoryListLoading: true
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
                "name": "Nancy Smith",
            },
            "isAuthenticated": true,
            "currentPage": "",
            "showApplications": true,
            "showViewSubmissions": true
        }
    
}


export const bpmTasks = {
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
    tasks:{
        tasksList:[
            {
               
                "_embedded": null,
                "id": "123",
                "name": "Review Submission",
                "assignee": null,
                "created": "2021-12-13T07:10:36.808+0000",
                "due": null,
                "followUp": null,
                "delegationState": null,
                "description": null,
                "owner": null,
                "parentTaskId": null,
                "priority": 50,
                "taskDefinitionKey": "reviewer",
                "caseExecutionId": null,
                "caseInstanceId": null,
                "caseDefinitionId": null,
                "suspended": false,
                "formKey": null,
                "tenantId": null
            }
        ],
        isFilterLoading: false,
        isGroupLoading: false,
        isHistoryListLoading: true,
        isTaskDetailLoading: true,
        isTaskDetailUpdating: false,
        isTaskListLoading: false,
        isTaskUpdating: false,
        tasksCount: 1
    }
    
}

export const ZeroTasks = {
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
    tasks:{
        tasksList:[],
        isFilterLoading: false,
        isGroupLoading: false,
        isHistoryListLoading: true,
        isTaskDetailLoading: true,
        isTaskDetailUpdating: false,
        isTaskListLoading: false,
        isTaskUpdating: false,
        tasksCount: 0
    }
    
}

export const taskDetail = {
    tasks:{
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
    }
}
