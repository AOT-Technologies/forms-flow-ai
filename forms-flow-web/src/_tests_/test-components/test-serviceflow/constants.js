export const initialstate = {
    formDelete:{
        isFormSubmissionLoading: false
    },
    user:{
            
            "userDetail": {                   
                "preferred_username": "sample name",                   
            },
            "isAuthenticated": true,
            "currentPage": "",
            "showApplications": true,
            "showViewSubmissions": true    
    },
    bpmTasks:{
        taskGroups:[
            {
                "userId": null,
                "groupId": "formsflow/formsflow-reviewer",
                "type": "candidate"
            }
        ],
        filterSearchSelections:[],
        processList:[
            {
                "id": "sample_id_1",
                "key": "Atm",
                "description": null,
                "name": null,
                "version": 1,
                "resource": "atm-workflow.bpmn",
                "deploymentId": "deployment_id_1",
                "diagram": null,
                "suspended": false,
                "tenantId": null,
                "versionTag": null,
                "historyTimeToLive": null,
                "startableInTasklist": true
            },
            {
                "id": "sample_id_2",
                "key": "atm-process",
                "description": null,
                "name": "ATM Process",
                "version": 1,
                "resource": "atm-workflow.bpmn",
                "deploymentId": "deployment_id_2",
                "diagram": null,
                "suspended": false,
                "tenantId": null,
                "versionTag": "1",
                "historyTimeToLive": null,
                "startableInTasklist": true
            }
        ],
        tasksList:[
            {
                "_embedded": null,
                "id": "4bed2c7b-5c01-11ec-b3b9-0242ac190008",
                "name": "Review Submission",
                "assignee": "assignee_name_1",
                "created": "2021-12-13T10:41:58.020+0000",
                "due": null,
                "followUp": null,
                "delegationState": null,
                "description": null,
                "executionId": "4b8a9a12-5c01-11ec-b3b9-0242ac190008",
                "owner": null,
                "parentTaskId": null,
                "priority": 50,
                "processDefinitionId": "processDefinitionId_1",
                "processInstanceId": "processInstanceId_1",
                "taskDefinitionKey": "reviewer",
                "caseExecutionId": null,
                "caseInstanceId": null,
                "caseDefinitionId": null,
                "suspended": false,
                "formKey": null,
                "tenantId": null
            },
            {
                "_embedded": null,
                "id": "c555c8b2-5be3-11ec-b3b9-0242ac190008",
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
                "processDefinitionId": "processDefinitionId_2",
                "processInstanceId": "processInstanceId_2",
                "taskDefinitionKey": "reviewer",
                "caseExecutionId": null,
                "caseInstanceId": null,
                "caseDefinitionId": null,
                "suspended": false,
                "formKey": null,
                "tenantId": null
            }
        ],
        listReqParams:{
            sorting:[{sortBy: 'created', sortOrder: 'desc', label: 'Created'}]
        },
        filterListSearchParams:{},
        filterListSortParams:{
            sorting:[{sortBy: 'created', sortOrder: 'desc', label: 'Created'}]
        },
        listReqParams:{
            sorting:[{sortBy: 'created', sortOrder: 'desc', label: 'Created'}]
        },
        taskId: "569a3712-5bdd-11ec-81d3-0242ac190008",
        filterList:[
            {
                "id": "1d_1",
                "resourceType": "Task",
                "name": "All tasks",
                "owner": null,
                "query": {
                    "taskVariables": [],
                    "processVariables": [],
                    "caseInstanceVariables": [],
                    "orQueries": []
                },
                "properties": {}
            },
            {
                "id": "id_2",
                "resourceType": "Task",
                "name": "Clerk Task",
                "owner": null,
                "query": {
                    "candidateGroup": "formsflow/formsflow-reviewer/clerk",
                    "includeAssignedTasks": true,
                    "taskVariables": [],
                    "processVariables": [],
                    "caseInstanceVariables": [],
                    "orQueries": []
                },
                "properties": {
                    "color": "#555555",
                    "showUndefinedVariable": false,
                    "refresh": false,
                    "priority": 0
                }
            }            
        ],
        isFilterLoading: false,
        selectedFilter:{
            "id": "random_id",
            "resourceType": "Task",
            "name": "All tasks",
            "owner": null,
            "query": {
                "taskVariables": [],
                "processVariables": [],
                "caseInstanceVariables": [],
                "orQueries": []
            },
            "properties": {}
        },
    }
}