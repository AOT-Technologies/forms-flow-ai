import ACTION_CONSTANTS from "../actions/actionConstants";
import {formatForms} from "../apiManager/services/bpmServices";

const initialState = {
  formList:[],
  isFormLoading:false
}

const bpmForms = (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.BPM_FORM_LIST:
      return {...state, formList: formatForms(action.payload), isFormLoading: false};
    case ACTION_CONSTANTS.IS_BPM_FORM_LIST_LOADING:
      return {...state, isFormLoading: action.payload};
    default:
      return state;
  }
};
export default bpmForms;
