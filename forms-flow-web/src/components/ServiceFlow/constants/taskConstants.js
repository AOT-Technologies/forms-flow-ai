import { Translation } from "react-i18next";
export const sortingList = [
  {sortBy:"created",label:<Translation>{(t)=>t("created")}</Translation>, sortOrder:"asc"},
  {sortBy:"priority",label:<Translation>{(t)=>t("priority")}</Translation>, sortOrder:"asc"},
  {sortBy:"dueDate",label:<Translation>{(t)=>t("due_date")}</Translation>, sortOrder:"asc"},
  {sortBy:"assignee",label:<Translation>{(t)=>t("assigne")}</Translation>, sortOrder:"asc"},
  {sortBy:"name",label:<Translation>{(t)=>t("task_name")}</Translation>, sortOrder:"asc"},
  {sortBy:"followUpDate",label:<Translation>{(t)=>t("follow_up_date")}</Translation>, sortOrder:"asc"},
];

export const searchData = [
  {"label": <Translation>{(t)=>t("task_variable")}</Translation>, "compares": [">", ">=", "=","!=", "<", "<="]},
  {"label": <Translation>{(t)=>t("process_variable")}</Translation>, "compares": [">", ">=", "=","!=", "<", "<="]},
  {"label": <Translation>{(t)=>t("process_def_name")}</Translation>, "compares": ["like", "="], "values": ["processDefinitionNameLike", "processDefinitionName"]},
  {"label": <Translation>{(t)=>t("assigne")}</Translation>, "compares": ["like", "="], "values": ["assigneeLike", "assignee"]},
  {"label": <Translation>{(t)=>t("candidate_group")}</Translation>, "compares": ["="], "values": ["candidateGroup"]},
  {"label": <Translation>{(t)=>t("candidate_user")}</Translation>, "compares": ["="], "values": ["candidateUser"]},
  {"label": <Translation>{(t)=>t("name")}</Translation>, "compares": ["like", "="], "values": ["nameLike", "name"]},
  {"label": <Translation>{(t)=>t("description")}</Translation>,"compares": ["like", "="], "values": ["descriptionLike", "description"] },
  {"label": <Translation>{(t)=>t("priority")}</Translation>, "compares": ["="], "values": ["priority"]},
  {"label": <Translation>{(t)=>t("due_date")}</Translation>, "compares": ["before", "after"], "values": ["due"]},
  {"label": <Translation>{(t)=>t("follow_up_date")}</Translation>, "compares": ["before", "after"], "values": ["followUp"]},
  {"label": <Translation>{(t)=>t("created")}</Translation>, "compares": ["before", "after"], "values": ["created"]},
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
  {label:<Translation>{(t)=>t("process_variable")}</Translation>,key:"processVariables", operator:FILTER_OPERATOR_TYPES.EQUAL, type:Filter_Search_Types.VARIABLES, value:"", name:""},
  {label:<Translation>{(t)=>t("task_variable")}</Translation>, key:"taskVariables",operator:FILTER_OPERATOR_TYPES.EQUAL, type:Filter_Search_Types.VARIABLES, value:"", name:""},
  {label:<Translation>{(t)=>t("process_def_name")}</Translation>,key:"processDefinitionName", operator:FILTER_OPERATOR_TYPES.LIKE, type:Filter_Search_Types.STRING, value:"" },
  {label:<Translation>{(t)=>t("assigne")}</Translation>,key:"assignee",operator:FILTER_OPERATOR_TYPES.LIKE, type:Filter_Search_Types.STRING,value:"", },
  {label:<Translation>{(t)=>t("candidate_group")}</Translation>,key:"candidateGroup",operator:FILTER_OPERATOR_TYPES.EQUAL,type:Filter_Search_Types.NORMAL, value:""},
  {label:<Translation>{(t)=>t("candidate_user")}</Translation>,key:"candidateUser",operator:FILTER_OPERATOR_TYPES.EQUAL,type:Filter_Search_Types.NORMAL, value:""},
  {label:<Translation>{(t)=>t("name")}</Translation>,key:"name",operator:FILTER_OPERATOR_TYPES.LIKE,type:Filter_Search_Types.STRING,value:""},
  {label:<Translation>{(t)=>t("description")}</Translation>,key:"description",operator:FILTER_OPERATOR_TYPES.LIKE,type:Filter_Search_Types.STRING, value:""},
  {label:<Translation>{(t)=>t("priority")}</Translation>,key:"priority",operator:FILTER_OPERATOR_TYPES.EQUAL,type:Filter_Search_Types.NORMAL, value:""},
  {label:<Translation>{(t)=>t("due_date")}</Translation>,key:"due",operator:FILTER_OPERATOR_TYPES.BEFORE, type:Filter_Search_Types.DATE, value:""},
  {label:<Translation>{(t)=>t("follow_up_date")}</Translation>,key:"followUp",operator:FILTER_OPERATOR_TYPES.BEFORE, type:Filter_Search_Types.DATE, value:""},
  {label:<Translation>{(t)=>t("created")}</Translation>,key:"created",operator:FILTER_OPERATOR_TYPES.BEFORE,type:Filter_Search_Types.DATE, value:"" },
];

export const ALL_TASKS="All tasks"
export const QUERY_TYPES= {ANY:<Translation>{(t)=>t("any")}</Translation>,ALL:<Translation>{(t)=>t("all")}</Translation>};
export const MAX_RESULTS= 15; //maxResults

