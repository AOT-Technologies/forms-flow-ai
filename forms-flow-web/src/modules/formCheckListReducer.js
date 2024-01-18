import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  formList: [],
  formUploadFormList: [],
  formUploadCounter: 0,
  formUploadFailureCounter: 0,
  designerFormLoading: false,
  searchFormLoading: false,
  designerAccessDenied: false
};

const formCheckList = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CONSTANTS.FORM_CHECK_LIST_UPDATE:
      return { ...state, formList: action.payload };
    case ACTION_CONSTANTS.FORM_UPLOAD_LIST:
      return {
        ...state,
        formUploadFormList: action.payload,
        formUploadCounter: 0,
        formUploadFailureCounter: 0,
      };
    case ACTION_CONSTANTS.FORM_UPLOAD_COUNTER:
      return { ...state, formUploadCounter: state.formUploadCounter + 1 };
    case ACTION_CONSTANTS.FORM_UPLOAD_FAILURE_COUNTER:
      return { ...state, formUploadFailureCounter: state.formUploadFailureCounter + 1 };
    case ACTION_CONSTANTS.IS_FORM_LOADING:
      return { ...state, designerFormLoading: action.payload };
    case ACTION_CONSTANTS.IS_FORM_SEARCH_LOADING:
      return { ...state, searchFormLoading: action.payload };
    case ACTION_CONSTANTS.DESIGNER_DENIED_ACCESS:
      return { ...state, designerAccessDenied: action.payload };
    default:
      return state;
  }
};

export default formCheckList;
