import { Trans } from "react-i18next";
export const sortingList = [
  {sortBy:"created",label:<Trans>{"created"}</Trans>, sortOrder:"asc"},
  {sortBy:"priority",label:<Trans>{"priority"}</Trans>, sortOrder:"asc"},
  {sortBy:"dueDate",label:<Trans>{"due_date"}</Trans>, sortOrder:"asc"},
  {sortBy:"assignee",label:<Trans>{"assigne"}</Trans>, sortOrder:"asc"},
  {sortBy:"name",label:<Trans>{"task_name"}</Trans>, sortOrder:"asc"},
  {sortBy:"followUpDate",label:<Trans>{"follow_up_date"}</Trans>, sortOrder:"asc"},
];

export const searchData = [
  {"label": <Trans>{"task_variable"}</Trans>, "compares": [">", ">=", "=","!=", "<", "<="]},
  {"label": <Trans>{"process_variable"}</Trans>, "compares": [">", ">=", "=","!=", "<", "<="]},
  {"label": <Trans>{"process_def_name"}</Trans>, "compares": ["like", "="], "values": ["processDefinitionNameLike", "processDefinitionName"]},
  {"label": <Trans>{"assigne"}</Trans>, "compares": ["like", "="], "values": ["assigneeLike", "assignee"]},
  {"label": <Trans>{"candidate_group"}</Trans>, "compares": ["="], "values": ["candidateGroup"]},
  {"label": <Trans>{"candidate_user"}</Trans>, "compares": ["="], "values": ["candidateUser"]},
  {"label": <Trans>{"name"}</Trans>, "compares": ["like", "="], "values": ["nameLike", "name"]},
  {"label": <Trans>{"description"}</Trans>,"compares": ["like", "="], "values": ["descriptionLike", "description"] },
  {"label": <Trans>{"priority"}</Trans>, "compares": ["="], "values": ["priority"]},
  {"label": <Trans>{"due_date"}</Trans>, "compares": ["before", "after"], "values": ["due"]},
  {"label": <Trans>{"follow_up_date"}</Trans>, "compares": ["before", "after"], "values": ["followUp"]},
  {"label": <Trans>{"created"}</Trans>, "compares": ["before", "after"], "values": ["created"]},
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
  {label:<Trans>{"process_variable"}</Trans>,key:"processVariables", operator:FILTER_OPERATOR_TYPES.EQUAL, type:Filter_Search_Types.VARIABLES, value:"", name:""},
  {label:<Trans>{"task_variable"}</Trans>, key:"taskVariables",operator:FILTER_OPERATOR_TYPES.EQUAL, type:Filter_Search_Types.VARIABLES, value:"", name:""},
  {label:<Trans>{"process_def_name"}</Trans>,key:"processDefinitionName", operator:FILTER_OPERATOR_TYPES.LIKE, type:Filter_Search_Types.STRING, value:"" },
  {label:<Trans>{"assigne"}</Trans>,key:"assignee",operator:FILTER_OPERATOR_TYPES.LIKE, type:Filter_Search_Types.STRING,value:"", },
  {label:<Trans>{"candidate_group"}</Trans>,key:"candidateGroup",operator:FILTER_OPERATOR_TYPES.EQUAL,type:Filter_Search_Types.NORMAL, value:""},
  {label:<Trans>{"candidate_user"}</Trans>,key:"candidateUser",operator:FILTER_OPERATOR_TYPES.EQUAL,type:Filter_Search_Types.NORMAL, value:""},
  {label:<Trans>{"name"}</Trans>,key:"name",operator:FILTER_OPERATOR_TYPES.LIKE,type:Filter_Search_Types.STRING,value:""},
  {label:<Trans>{"description"}</Trans>,key:"description",operator:FILTER_OPERATOR_TYPES.LIKE,type:Filter_Search_Types.STRING, value:""},
  {label:<Trans>{"priority"}</Trans>,key:"priority",operator:FILTER_OPERATOR_TYPES.EQUAL,type:Filter_Search_Types.NORMAL, value:""},
  {label:<Trans>{"due_date"}</Trans>,key:"due",operator:FILTER_OPERATOR_TYPES.BEFORE, type:Filter_Search_Types.DATE, value:""},
  {label:<Trans>{"follow_up_date"}</Trans>,key:"followUp",operator:FILTER_OPERATOR_TYPES.BEFORE, type:Filter_Search_Types.DATE, value:""},
  {label:<Trans>{"created"}</Trans>,key:"created",operator:FILTER_OPERATOR_TYPES.BEFORE,type:Filter_Search_Types.DATE, value:"" },
];

export const ALL_TASKS="All tasks"
export const QUERY_TYPES= {ANY:<Trans>{("any")}</Trans>,ALL:<Trans>{("all")}</Trans>};
export const MAX_RESULTS= 15; //maxResults

