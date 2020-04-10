import ACTION_CONSTANTS from "../actions/actionConstants";
const initialState = {
  currentBPMUser: {}
}

export default (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.SET_USER_TOKEN:
      return {...state, currentBPMUser: action.payload}
    default:
      return state;
  }
}
