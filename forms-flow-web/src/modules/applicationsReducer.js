import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  applicationsList:[],
  applicationDetail: {},
  formApplicationsList:[],
  isApplicationListLoading:false,
  isApplicationDetailLoading:false
}

export default (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.LIST_APPLICATIONS :
      return {...state, applicationsList: action.payload, isApplicationListLoading:false};
    case ACTION_CONSTANTS.LIST_APPLICATIONS_OF_FORM :
      return {...state, formApplicationsList: action.payload, isApplicationListLoading:false};
    case ACTION_CONSTANTS.APPLICATION_DETAIL :
      return {...state, applicationDetail: action.payload, isApplicationDetailLoading:false};
    case ACTION_CONSTANTS.IS_APPLICATION_LIST_LOADING:
      return {...state, isApplicationListLoading: action.payload};
    case ACTION_CONSTANTS.IS_APPLICATION_DETAIL_LOADING:
      return {...state, isApplicationDetailLoading: action.payload};
    default:
      return state;
  }
}

