import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  isLoading:true,
  tasksList:[],
  tasksCount:0,
  taskDetail: {},
  isTaskUpdating:false,
  appHistory:[],
  isHistoryListLoading: true
}


const tasks = (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.IS_LOADING:
      return {...state, isLoading: action.payload};
    case ACTION_CONSTANTS.LIST_TASKS:
      return {...state, tasksList: action.payload};
    case ACTION_CONSTANTS.TASKS_COUNT:
      return {...state, tasksCount: action.payload.count};
    case ACTION_CONSTANTS.TASK_DETAIL:
      return {...state, taskDetail: action.payload};
    case ACTION_CONSTANTS.IS_TASK_UPDATING:
    return {...state, isTaskUpdating: action.payload};
    case ACTION_CONSTANTS.IS_HISTORY_LOADING:
      return {...state, isHistoryListLoading: action.payload};
    case ACTION_CONSTANTS.LIST_APPLICATION_HISTORY:
      return {...state, appHistory: action.payload};
    default:
      return state;
  }
}

export default tasks ;
