import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  tasksList:[],
  tasksCount:0
}

export default (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.LIST_TASKS:
      return {...state, tasksList: action.payload};
      break;
    case ACTION_CONSTANTS.TASKS_COUNT:
      return {...state, tasksCount: action.payload};
      break;
    default:
      return state;
  }
}
