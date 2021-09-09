import ACTION_CONSTANTS from "../actions/actionConstants";
import {setShowApplications, setShowViewSubmissions} from "../helper/user";
import { LANGUAGE } from "../constants/constants";
const initialState = {
  bearerToken: '',
  roles: '',
  userDetail:null,
  isAuthenticated:false,
  currentPage:'',
  showApplications:false,
  showViewSubmissions:false,
  lang:localStorage.getItem('lang')?localStorage.getItem('lang'):LANGUAGE,

}


const user = (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.SET_CURRENT_PAGE:
      return {...state, currentPage: action.payload};
    case ACTION_CONSTANTS.SET_USER_TOKEN:
      localStorage.setItem('authToken', action.payload);
      return {...state, bearerToken: action.payload};
    case ACTION_CONSTANTS.SET_USER_ROLES:
      return {...state, roles: action.payload};
    case ACTION_CONSTANTS.SET_USER_DETAILS:
      return {...state, userDetail:action.payload,
        showApplications:setShowApplications(action.payload?.groups||[]),
        showViewSubmissions:setShowViewSubmissions(action.payload?.groups||[])
      }
    case ACTION_CONSTANTS.SET_USER_AUTHENTICATION:
      return {...state, isAuthenticated:action.payload}
    case ACTION_CONSTANTS.SET_LANGUAGE:
      localStorage.setItem('lang',action.payload);
      return {...state, lang:action.payload}
    default:
      return state;
  }
}

export default user;
