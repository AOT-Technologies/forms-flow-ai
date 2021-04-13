export const sortingList = [
  {sortBy:"created",label:"Created", sortOrder:"asc"},
  {sortBy:"priority",label:"Priority", sortOrder:"asc"},
  {sortBy:"dueDate",label:"Due date", sortOrder:"asc"},
  {sortBy:"assignee",label:"Assignee", sortOrder:"asc"},
  {sortBy:"name",label:"Task name", sortOrder:"asc"},
  {sortBy:"followUpDate",label:"Follow-up date", sortOrder:"asc"},
];

export const searchData = [
  {"label": "Task Variables", "compares": [">", ">=", "=","!=", "<", "<="]},
  {"label": "Process Variables", "compares": [">", ">=", "=","!=", "<", "<="]},
  {"label": "Process Definition Name", "compares": ["like", "="], "values": ["processDefinitionNameLike", "processDefinitionName"]},
  {"label": "Assignee", "compares": ["like", "="], "values": ["assigneeLike", "assignee"]},
  {"label":"Candidate Group", "compares": ["="], "values": ["candidateGroup"]},
  {"label":"Candidate User", "compares": ["="], "values": ["candidateUser"]},
  {"label":"Name", "compares": ["like", "="], "values": ["nameLike", "name"]},
  {"label": "Description","compares": ["like", "="], "values": ["descriptionLike", "description"] },
  {"label":"Priority", "compares": ["="], "values": ["priority"]},
  {"label":"Due Date", "compares": ["before", "after"], "values": ["due"]},
  {"label":"Follow up Date", "compares": ["before", "after"], "values": ["followUp"]},
  {"label":"Created", "compares": ["before", "after"], "values": ["created"]},
]

export const Filter_Search_Types = {
  VARIABLES:"variables",
  STRING:"string",
  DATE:"date",
  NORMAL:"normal"
}


export const FILTER_OPERATOR_TYPES = {
  EQUAL:"=",
  LIKE:"like",
  BEFORE:"before",
  AFTER:"after"
}

//TODO update to further constants
export const FILTER_COMPARE_OPTIONS = {
  [Filter_Search_Types.VARIABLES]:[">", ">=", FILTER_OPERATOR_TYPES.EQUAL ,"!=", "<", "<=",FILTER_OPERATOR_TYPES.LIKE],
  [Filter_Search_Types.DATE]:[FILTER_OPERATOR_TYPES.BEFORE, FILTER_OPERATOR_TYPES.AFTER],
  [Filter_Search_Types.STRING]:[FILTER_OPERATOR_TYPES.EQUAL,FILTER_OPERATOR_TYPES.LIKE],
  [Filter_Search_Types.NORMAL]:[FILTER_OPERATOR_TYPES.EQUAL]
};

export const taskFilters = [
  {label:"Process Variables",key:"processVariables", operator:FILTER_OPERATOR_TYPES.EQUAL, type:Filter_Search_Types.VARIABLES, value:"", name:""},
  {label:"Task Variables", key:"taskVariables",operator:FILTER_OPERATOR_TYPES.EQUAL, type:Filter_Search_Types.VARIABLES, value:"", name:""},
  {label:"Process Definition Name",key:"processDefinitionName", operator:FILTER_OPERATOR_TYPES.LIKE, type:Filter_Search_Types.STRING, value:"" },
  {label:"Assignee",key:"assignee",operator:FILTER_OPERATOR_TYPES.LIKE, type:Filter_Search_Types.STRING,value:"", },
  {label:"Candidate Group",key:"candidateGroup",operator:FILTER_OPERATOR_TYPES.EQUAL,type:Filter_Search_Types.NORMAL, value:""},
  {label:"Candidate User",key:"candidateUser",operator:FILTER_OPERATOR_TYPES.EQUAL,type:Filter_Search_Types.NORMAL, value:""},
  {label:"Name",key:"name",operator:FILTER_OPERATOR_TYPES.LIKE,type:Filter_Search_Types.STRING,value:""},
  {label:"Description",key:"description",operator:FILTER_OPERATOR_TYPES.LIKE,type:Filter_Search_Types.STRING, value:""},
  {label:"Priority",key:"priority",operator:FILTER_OPERATOR_TYPES.EQUAL,type:Filter_Search_Types.NORMAL, value:""},
  {label:"Due Date",key:"due",operator:FILTER_OPERATOR_TYPES.BEFORE, type:Filter_Search_Types.DATE, value:""},
  {label:"Follow up Date",key:"followUp",operator:FILTER_OPERATOR_TYPES.BEFORE, type:Filter_Search_Types.DATE, value:""},
  {label:"Created",key:"created",operator:FILTER_OPERATOR_TYPES.BEFORE,type:Filter_Search_Types.DATE, value:"" },
];

export const ALL_TASKS="All tasks"
export const QUERY_TYPES= {ANY:"ANY",ALL:"ALL"};
