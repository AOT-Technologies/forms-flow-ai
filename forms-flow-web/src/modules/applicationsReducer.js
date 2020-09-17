import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  applicationsList:[],
  applicationDetail: {},
  applicationProcess: {}
}

export default (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.LIST_APPLICATIONS :
      return {...state, applications: action.payload};
    case ACTION_CONSTANTS.APPLICATION_DETAIL :
      return {...state, applicationDetail: action.payload};
    case ACTION_CONSTANTS.APPLICATION_PROCESS :
      return {...state, applicationProcess: action.payload};  
    default:
      return state;
  }
}

