import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  tasksList:[]
}

export default (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.LIST_TASKS:
      return {...state, tasksList: action.payload};
    default:
      return state;
  }
}
