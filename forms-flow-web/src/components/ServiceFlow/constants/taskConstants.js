import { Translation } from "react-i18next";
export const sortingList = [
  {sortBy:"created",label:<Translation>{(t)=>t("Created")}</Translation>, sortOrder:"asc"},
  {sortBy:"priority",label:<Translation>{(t)=>t("Priority")}</Translation>, sortOrder:"asc"},
  {sortBy:"dueDate",label:<Translation>{(t)=>t("Due Date")}</Translation>, sortOrder:"asc"},
  {sortBy:"assignee",label:<Translation>{(t)=>t("Assignee")}</Translation>, sortOrder:"asc"},
  {sortBy:"name",label:<Translation>{(t)=>t("Task name")}</Translation>, sortOrder:"asc"},
  {sortBy:"followUpDate",label:<Translation>{(t)=>t("Follow up Date")}</Translation>, sortOrder:"asc"},
];

export const searchData = [
  {"label": <Translation>{(t)=>t("Task Variables")}</Translation>, "compares": [">", ">=", "=","!=", "<", "<="]},
  {"label": <Translation>{(t)=>t("Process Variables")}</Translation>, "compares": [">", ">=", "=","!=", "<", "<="]},
  {"label": <Translation>{(t)=>t("Process Definition Name")}</Translation>, "compares": ["like", "="], "values": ["processDefinitionNameLike", "processDefinitionName"]},
  {"label": <Translation>{(t)=>t("Assignee")}</Translation>, "compares": ["like", "="], "values": ["assigneeLike", "assignee"]},
  {"label": <Translation>{(t)=>t("Candidate Group")}</Translation>, "compares": ["="], "values": ["candidateGroup"]},
  {"label": <Translation>{(t)=>t("Candidate User")}</Translation>, "compares": ["="], "values": ["candidateUser"]},
  {"label": <Translation>{(t)=>t("Name")}</Translation>, "compares": ["like", "="], "values": ["nameLike", "name"]},
  {"label": <Translation>{(t)=>t("Description")}</Translation>,"compares": ["like", "="], "values": ["descriptionLike", "Description"] },
  {"label": <Translation>{(t)=>t("Priority")}</Translation>, "compares": ["="], "values": ["priority"]},
  {"label": <Translation>{(t)=>t("Due Date")}</Translation>, "compares": ["before", "after"], "values": ["due"]},
  {"label": <Translation>{(t)=>t("Follow up Date")}</Translation>, "compares": ["before", "after"], "values": ["followUp"]},
  {"label": <Translation>{(t)=>t("Created")}</Translation>, "compares": ["before", "after"], "values": ["Created"]},
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
  {label:<Translation>{(t)=>t("Process Variables")}</Translation>,key:"processVariables", operator:FILTER_OPERATOR_TYPES.EQUAL, type:Filter_Search_Types.VARIABLES, value:"", name:""},
  {label:<Translation>{(t)=>t("Task Variables")}</Translation>, key:"taskVariables",operator:FILTER_OPERATOR_TYPES.EQUAL, type:Filter_Search_Types.VARIABLES, value:"", name:""},
  {label:<Translation>{(t)=>t("Process Definition Name")}</Translation>,key:"processDefinitionName", operator:FILTER_OPERATOR_TYPES.LIKE, type:Filter_Search_Types.STRING, value:"" },
  {label:<Translation>{(t)=>t("Assignee")}</Translation>,key:"assignee",operator:FILTER_OPERATOR_TYPES.LIKE, type:Filter_Search_Types.STRING,value:"", },
  {label:<Translation>{(t)=>t("Candidate Group")}</Translation>,key:"candidateGroup",operator:FILTER_OPERATOR_TYPES.EQUAL,type:Filter_Search_Types.NORMAL, value:""},
  {label:<Translation>{(t)=>t("Candidate User")}</Translation>,key:"candidateUser",operator:FILTER_OPERATOR_TYPES.EQUAL,type:Filter_Search_Types.NORMAL, value:""},
  {label:<Translation>{(t)=>t("Name")}</Translation>,key:"name",operator:FILTER_OPERATOR_TYPES.LIKE,type:Filter_Search_Types.STRING,value:""},
  {label:<Translation>{(t)=>t("Description")}</Translation>,key:"Description",operator:FILTER_OPERATOR_TYPES.LIKE,type:Filter_Search_Types.STRING, value:""},
  {label:<Translation>{(t)=>t("Priority")}</Translation>,key:"priority",operator:FILTER_OPERATOR_TYPES.EQUAL,type:Filter_Search_Types.NORMAL, value:""},
  {label:<Translation>{(t)=>t("Due Date")}</Translation>,key:"due",operator:FILTER_OPERATOR_TYPES.BEFORE, type:Filter_Search_Types.DATE, value:""},
  {label:<Translation>{(t)=>t("Follow up Date")}</Translation>,key:"followUp",operator:FILTER_OPERATOR_TYPES.BEFORE, type:Filter_Search_Types.DATE, value:""},
  {label:<Translation>{(t)=>t("Created")}</Translation>,key:"Created",operator:FILTER_OPERATOR_TYPES.BEFORE,type:Filter_Search_Types.DATE, value:"" },
];

export const ALL_TASKS="All tasks"
export const QUERY_TYPES= {ANY:<Translation>{(t)=>t("ANY")}</Translation>,ALL:<Translation>{(t)=>t("All")}</Translation>};
export const MAX_RESULTS= 15; //maxResults

