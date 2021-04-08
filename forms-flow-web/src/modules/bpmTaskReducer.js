import ACTION_CONSTANTS from "../actions/actionConstants";
import {TASK_FILTER_LIST_DEFAULT_PARAM} from "../constants/taskConstants";
import {getFormattedParams} from "../apiManager/services/taskSearchParamsFormatter";
import {QUERY_TYPES} from "../components/ServiceFlow/constants/taskConstants";

const initialState = {
  isTaskListLoading:false,
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
  filterListSortParams:{sorting:TASK_FILTER_LIST_DEFAULT_PARAM},
  filterSearchSelections:[],
  filterListSearchParams:{},
  searchQueryType:QUERY_TYPES.ALL,
  variableNameIgnoreCase:false,
  variableValueIgnoreCase:false,
  taskGroups:[]
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
    case ACTION_CONSTANTS.BPM_FITER_LIST:
      return {...state, filterList: action.payload};
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
      return {...state, filterListSearchParams:getFormattedParams(action.payload), filterSearchSelections:action.payload}
    default:
      return state;
  }
};

export default bpmTasks;
