import ACTION_CONSTANTS from "../actions/actionConstants";

export const initialState = {
  applicationsList:[],
  applicationDetail: {},
  applicationProcess: {},
  formApplicationsList:[],
  isApplicationListLoading:true,
  isApplicationDetailLoading:false,
  isApplicationUpdating:false,
  applicationCount:0,
  applicationDetailStatusCode:'',
  activePage:1,
  countPerPage:5,
  applicationStatus:[],
  iserror:false,
  error:'',
  isPublicStatusLoading:false
}


const applications = (state = initialState, action)=> {
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
    case ACTION_CONSTANTS.IS_APPLICATION_UPDATING:
      return {...state, isApplicationUpdating: action.payload};
    case ACTION_CONSTANTS.APPLICATION_PROCESS :
      return {...state, applicationProcess: action.payload};
    case ACTION_CONSTANTS.SET_APPLICATION_LIST_COUNT :
      return {...state, applicationCount: action.payload};
    case ACTION_CONSTANTS.APPLICATION_DETAIL_STATUS_CODE:
      return {...state,applicationDetailStatusCode: action.payload};
    case ACTION_CONSTANTS.APPLICATION_LIST_ACTIVE_PAGE:
      return {...state,activePage: action.payload};
    case ACTION_CONSTANTS.CHANGE_SIZE_PER_PAGE:
      return {...state,countPerPage:action.payload}
    case ACTION_CONSTANTS.APPLICATION_STATUS_LIST:
      return {...state,applicationStatus:action.payload}
    case ACTION_CONSTANTS.APPLICATIONS_ERROR:
      return {...state,iserror:true,error:action.payload,isApplicationListLoading:false}
    case ACTION_CONSTANTS.IS_PUBLIC_STATUS_LOADING:
      return {...state,isPublicStatusLoading:action.payload}
    default:
      return state;
  }
};
export default applications;


