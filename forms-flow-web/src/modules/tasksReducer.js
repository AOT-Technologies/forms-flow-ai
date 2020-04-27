import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  isLoading:true,
  tasksList:[],
  tasksCount:0
}

export default (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.IS_LOADING:
      return {...state, isLoading: action.payload};
      break;
    case ACTION_CONSTANTS.LIST_TASKS:
      return {...state, tasksList: action.payload};
      break;
    case ACTION_CONSTANTS.TASKS_COUNT:
      return {...state, tasksCount: action.payload.count};
      break;
    default:
      return state;
  }
}
