import ACTION_CONSTANTS from "../actions/actionConstants";

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
  processList:[],
  userList:[],
  filterList:[],
  isFilterLoading:true,
  selectedFilter:null,
  taskId:null
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
    default:
      return state;
  }
};

export default bpmTasks;
