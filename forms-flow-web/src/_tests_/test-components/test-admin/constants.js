export const dashboard = {
    id:2,
    name:'sample',
    approvedGroups:[
        {name:"group2",id:'group2id'}
    ]
}

export const groups = [
    {
        "id": "group2id",
        "name": "group2",
        "path": "/formsflow/formsflow-reviewer/redash/group2",
        "subGroups": [],
        "dashboards": [
                {'2': 'sample'},
                {'1': 'Freedom of Information Form'}
            ]
      },
      {
        "id": "group3id",
        "name": "group3",
        "path": "/formsflow/formsflow-reviewer/redash/group3",
        "subGroups": [],
        "dashboards": [
                {'2': 'sample'}
            ]
      },
]

export const groups1 = [
    {
        "id": "group1id",
        "name": "group2",
        "path": "/formsflow/formsflow-reviewer/redash/group2",
        "subGroups": [],
        "dashboards": [
           
            ]
      },
      {
        "id": "group3id",
        "name": "group3",
        "path": "/formsflow/formsflow-reviewer/redash/group3",
        "subGroups": [],
        "dashboards": [
              
            ]
      },
]

export const approvedGroups  = [
    {name:"group2",id:'group2id'},
    {name:"group3",id:'group3id'}
]



export const updatedState = {
    dashboards:[
        {
            id:2,
            name:'sample',
            approvedGroups:[
                {name: 'group2', id: 'group2id'},
                {name: 'group3', id: 'group3id'},
                {name: 'group4', id: 'group4id'},
                {name: 'group5', id: 'group5id'},
                {name: 'group6', id: 'group6id'}
            ],
        }    ,
        {
            id:1,
            name:'Freedom of Information Form',
            approvedGroups:[
                {name: 'group1', id: 'group1id'},
                {name: 'group2', id: 'group2id'},
                {name: 'group5', id: 'group5id'},
            ],
        }     
    ],
    isloading:false,
    iserror:false,
    groups: [
        {id: 'group1id', name: 'group1',dashboards:[{1: 'Freedom of Information Form'}]}, 
        {id: 'group2id', name: 'group2',dashboards:[{2: 'sample'},{1: 'Freedom of Information Form'}]}, 
        {id: 'group3id', name: 'group3',dashboards:[{2: 'sample'}]}, 
        {id: 'group4id', name: 'group4',dashboards:[{2: 'sample'}]},
        {id: 'group5id', name: 'group5',dashboards:[{2: 'sample'},{1: 'Freedom of Information Form'}]},
        {id: 'group6id', name: 'group6',dashboards:[{2: 'sample'}]}, 
    ],
    isDashUpdated:true,
    isGroupUpdated:true,
		
}

export const dashboardToclean = 
     [
        "[{'5': 'Hello'}, {'4': 'testathira'}, {'6': 'New Business License Application'}, {'8': 'Sentiment Analysis'}, {'7': 'Freedom Of Information Form'}, {'3': 'test'}, {'12': 'dashboard4'}]"
    ]
export const cleanedDashboards =
    [
     {'5': 'Hello'}, {'4': 'testathira'}, {'6': 'New Business License Application'}, {'8': 'Sentiment Analysis'}, {'7': 'Freedom Of Information Form'}, {'3': 'test'}, {'12': 'dashboard4'}
    ]
