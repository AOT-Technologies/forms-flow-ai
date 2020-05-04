import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  isLoading:true,
  tasksList:[],
  tasksCount:0,
  taskDetail:[]
}

export default (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.IS_LOADING:
      return {...state, isLoading: action.payload};
    case ACTION_CONSTANTS.LIST_TASKS:
      return {...state, tasksList: action.payload};
    case ACTION_CONSTANTS.TASKS_COUNT:
      return {...state, tasksCount: action.payload.count};
    case ACTION_CONSTANTS.TASK_DETAIL:
      return {...state, taskDetail: action.payload};
    default:
      return state;
  }
}
