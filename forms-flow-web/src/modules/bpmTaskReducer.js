import ACTION_CONSTANTS from "../actions/actionConstants";
import {TASK_FILTER_LIST_DEFAULT_PARAM} from "../constants/taskConstants";
import {getFirstResultIndex, getFormattedParams} from "../apiManager/services/taskSearchParamsFormatterService";
import {QUERY_TYPES} from "../components/ServiceFlow/constants/taskConstants";
import {sortByPriorityList} from "../apiManager/services/filterListFormatterService";

const initialState = {
  isTaskListLoading:true,
  tasksList:[],
  tasksCount:0,
  taskDetail: null,
  isTaskUpdating:false,
  appHistory:[],
  isHistoryListLoading: true,
  isTaskDetailLoading:true,
  isTaskDetailUpdating:false,
  isGroupLoading:false,
  processList:[],
  userList:[],
  filterList:[],
  isFilterLoading:true,
  selectedFilter:null,
  taskId:null,
  filterListSortParams:{sorting:[{...TASK_FILTER_LIST_DEFAULT_PARAM}]},
  filterSearchSelections:[],
  filterListSearchParams:{},
  listReqParams:{sorting:[{...TASK_FILTER_LIST_DEFAULT_PARAM}]},
  searchQueryType:QUERY_TYPES.ALL,
  variableNameIgnoreCase:false,
  variableValueIgnoreCase:false,
  taskGroups:[],
  taskFormSubmissionReload:false,
  activePage:1,
  firstResult:0,
}

const bpmTasks =(state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.IS_BPM_TASK_LOADING:
      return {...state, isTaskListLoading: action.payload};
    case ACTION_CONSTANTS.IS_BPM_TASK_DETAIL_LOADING:
      return {...state, isTaskDetailLoading: action.payload};
    case ACTION_CONSTANTS.IS_BPM_TASK_DETAIL_UPDATING:
      return {...state, isTaskDetailUpdating: action.payload};
    case ACTION_CONSTANTS.BPM_LIST_TASKS:
      return {...state, tasksList: action.payload};
    case ACTION_CONSTANTS.BPM_PROCESS_LIST:
      return {...state, processList: action.payload};
    case ACTION_CONSTANTS.BPM_USER_LIST:
      return {...state, userList: action.payload};
    case ACTION_CONSTANTS.BPM_TASKS_COUNT:
      return {...state, tasksCount: action.payload.count};
    case ACTION_CONSTANTS.BPM_TASK_DETAIL:
      return {...state, taskDetail: action.payload};
    case ACTION_CONSTANTS.IS_BPM_TASK_UPDATING:
      return {...state, isTaskUpdating: action.payload};
    case ACTION_CONSTANTS.IS_HISTORY_LOADING:
      return {...state, isHistoryListLoading: action.payload};
    case ACTION_CONSTANTS.LIST_APPLICATION_HISTORY:
      return {...state, appHistory: action.payload};
    case ACTION_CONSTANTS.BPM_FILTER_LIST:
      return {...state, filterList: sortByPriorityList(action.payload)};
    case ACTION_CONSTANTS.IS_BPM_FILTERS_LOADING:
      return {...state, isFilterLoading: action.payload};
    case ACTION_CONSTANTS.BPM_SELECTED_FILTER:
      return {...state, selectedFilter: action.payload};
    case ACTION_CONSTANTS.SELECTED_TASK_ID:
      return {...state, taskId: action.payload, taskDetail:null};
    case ACTION_CONSTANTS.IS_TASK_GROUP_LOADING:
      return {...state, isGroupLoading: action.payload};
    case ACTION_CONSTANTS.SET_TASK_GROUP:
      return {...state, taskGroups:action.payload,isGroupLoading:false}
    case ACTION_CONSTANTS.UPDATE_FILTER_LIST_SORT_PARAMS:
      return {...state, filterListSortParams:{sorting:action.payload}}
    case ACTION_CONSTANTS.UPDATE_FILTER_LIST_SEARCH_PARAMS:
      return {...state, filterListSearchParams:getFormattedParams(action.payload,state.searchQueryType,state.variableNameIgnoreCase, state.variableValueIgnoreCase), filterSearchSelections:action.payload}
    case ACTION_CONSTANTS.UPDATE_SEARCH_QUERY_TYPE:
      return {...state, filterListSearchParams:getFormattedParams(state.filterSearchSelections,action.payload,state.variableNameIgnoreCase, state.variableValueIgnoreCase), searchQueryType:action.payload}
    case ACTION_CONSTANTS.UPDATE_VARIABLE_NAME_IGNORE_CASE:
      return {...state, filterListSearchParams:getFormattedParams(state.filterSearchSelections,state.searchQueryType,action.payload, state.variableValueIgnoreCase), variableNameIgnoreCase:action.payload}
    case ACTION_CONSTANTS.UPDATE_VARIABLE_VALUE_IGNORE_CASE:
      return {...state, filterListSearchParams:getFormattedParams(state.filterSearchSelections,state.searchQueryType,state.variableNameIgnoreCase,action.payload), variableValueIgnoreCase:action.payload}
    case ACTION_CONSTANTS.UPDATE_LIST_PARAMS:
      return {...state, listReqParams:action.payload}
    case ACTION_CONSTANTS.RELOAD_TASK_FORM_SUBMISSION:
      return {...state, taskFormSubmissionReload:action.payload}
    case ACTION_CONSTANTS.BPM_TASK_LIST_ACTIVE_PAGE:
      return {...state, activePage:action.payload, firstResult: getFirstResultIndex(action.payload)}
    default:
      return state;
  }
};

export default bpmTasks;
