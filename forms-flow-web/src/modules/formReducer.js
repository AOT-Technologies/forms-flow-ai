import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  formSubMissionDelete:{modalOpen:false,submissionId:"",formId:""},
  formDelete:{modalOpen:false,formId:"",formName:""},
  formSubmissionError:{modalOpen:false,message:""},
  isFormSubmissionLoading: false,
  isFormWorkflowSaved: false,
}

const formDelete = (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.FORM_SUBMISSION_DELETE:
      return {...state, formSubMissionDelete: action.payload};
    case ACTION_CONSTANTS.FORM_DELETE:
      return {...state, formDelete: action.payload};
    case ACTION_CONSTANTS.FORM_SUBMISSION_ERROR:
      return {...state, formSubmissionError: action.payload};
    case ACTION_CONSTANTS.IS_FORM_SUBMISSION_LOADING:
      return {...state, isFormSubmissionLoading: action.payload};
    case ACTION_CONSTANTS.IS_FORM_WORKFLOW_SAVED:
      return {...state, isFormWorkflowSaved: action.payload};
    default:
      return state;
  }
}

export default formDelete;
