export const dashboard = {
    id:2,
    name:'sample',
    approvedGroups:[
        {name:"group2",id:'6185f953-49c1-4dce-a7fd-56d4823d544d'}
    ]
}

export const groups = [
    {
        "id": "6185f953-49c1-4dce-a7fd-56d4823d544d",
        "name": "group2",
        "path": "/formsflow/formsflow-reviewer/redash/group2",
        "subGroups": [],
        "dashboards": [
                {'2': 'sample'},
                {'1': 'Freedom of Information Form'}
            ]
      },
      {
        "id": "95a00152-dd81-4e9b-9ee4-f6559fa88ebb",
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
        "id": "6185f953-49c1-4dce-a7fd-56d4823d544d",
        "name": "group2",
        "path": "/formsflow/formsflow-reviewer/redash/group2",
        "subGroups": [],
        "dashboards": [
           
            ]
      },
      {
        "id": "95a00152-dd81-4e9b-9ee4-f6559fa88ebb",
        "name": "group3",
        "path": "/formsflow/formsflow-reviewer/redash/group3",
        "subGroups": [],
        "dashboards": [
              
            ]
      },
]

export const approvedGroups  = [
    {name:"group2",id:'6185f953-49c1-4dce-a7fd-56d4823d544d'},
    {name:"group3",id:'95a00152-dd81-4e9b-9ee4-f6559fa88ebb'}
]



export const updatedState = {
    dashboards:[
        {
            id:2,
            name:'sample',
            approvedGroups:[
                {name: 'group2', id: '6185f953-49c1-4dce-a7fd-56d4823d544d'},
                {name: 'group3', id: '95a00152-dd81-4e9b-9ee4-f6559fa88ebb'},
                {name: 'group4', id: '6185f953-49c1-4dce-a7fd-56d4823d5445'},
                {name: 'group5', id: '6185f953-49c1-4dce-a7fd-56d4823d5443'},
                {name: 'group6', id: '6185f953-49c1-4dce-a7fd-56d4823d5440'}
            ],
        }    ,
        {
            id:1,
            name:'Freedom of Information Form',
            approvedGroups:[
                {name: 'group1', id: '7475ca67-b50e-41cd-ba52-89fc57bd562a'},
                {name: 'group2', id: '6185f953-49c1-4dce-a7fd-56d4823d544d'},
                {name: 'group5', id: '6185f953-49c1-4dce-a7fd-56d4823d5443'},
            ],
        }     
    ],
    isloading:false,
    iserror:false,
    groups: [
        {id: '7475ca67-b50e-41cd-ba52-89fc57bd562a', name: 'group1',dashboards:[{1: 'Freedom of Information Form'}]}, 
        {id: '6185f953-49c1-4dce-a7fd-56d4823d544d', name: 'group2',dashboards:[{2: 'sample'},{1: 'Freedom of Information Form'}]}, 
        {id: '95a00152-dd81-4e9b-9ee4-f6559fa88ebb', name: 'group3',dashboards:[{2: 'sample'}]}, 
        {id: '6185f953-49c1-4dce-a7fd-56d4823d5445', name: 'group4',dashboards:[{2: 'sample'}]},
        {id: '6185f953-49c1-4dce-a7fd-56d4823d5443', name: 'group5',dashboards:[{2: 'sample'},{1: 'Freedom of Information Form'}]},
        {id: '6185f953-49c1-4dce-a7fd-56d4823d5440', name: 'group6',dashboards:[{2: 'sample'}]}, 
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
