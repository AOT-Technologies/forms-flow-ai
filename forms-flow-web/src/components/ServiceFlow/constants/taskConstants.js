export const sortingList = [
  {sortBy:"created",label:"Created", sortOrder:"asc"},
  {sortBy:"priority",label:"Priority", sortOrder:"asc"},
  {sortBy:"dueDate",label:"Due date", sortOrder:"asc"},
  {sortBy:"assignee",label:"Assignee", sortOrder:"asc"},
  {sortBy:"name",label:"Task name", sortOrder:"asc"},
  {sortBy:"followUpDate",label:"Follow-up date", sortOrder:"asc"},
];

//TODO update to further constants
export const filterOptions = {
  variables:["=", "like"],
  date:["before", "after"],
  string:["=","like"]
};
export const Filter_Search_Types = {
  VARIABLES:"variables",
  STRING:"string",
  DATE:"date"
}

export const taskFilters = [
  {label:"Process Variables",key:"", option:"in", type:Filter_Search_Types.VARIABLES, value:"", name:""},
  {label:"Task Variables", key:"",option:"in", type:Filter_Search_Types.VARIABLES, value:"", name:""},
  {label:"Process Definition Name",key:"", option:"like",type:Filter_Search_Types.STRING, value:"" },
  {label:"Assignee",key:"",option:"like", type:Filter_Search_Types.STRING,value:"", },
  {label:"Candidate Group",key:"",option:"like",type:Filter_Search_Types.STRING, value:""},
  {label:"Candidate User",key:"",option:"like",type:Filter_Search_Types.STRING, value:""},
  {label:"Name",key:"",option:"like",type:Filter_Search_Types.STRING,value:""},
  {label:"Description",key:"",option:"like",type:Filter_Search_Types.STRING, value:""},
  {label:"Priority",key:"",option:"like",type:Filter_Search_Types.STRING, value:""},
  {label:"Due Date",key:"",option:"like", type:Filter_Search_Types.DATE, value:""},
  {label:"Follow up Date",key:"",option:"like", type:Filter_Search_Types.DATE, value:""},
  {label:"Created",key:"",option:"like",type:Filter_Search_Types.STRING, value:"" },
];

export const ALL_TASKS="All tasks"
export const QUERY_TYPES= {ANY:"ANY",ALL:"ALL"};
