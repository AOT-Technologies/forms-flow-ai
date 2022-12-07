import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  restoredFormData: {},
  restoreFormId: null,
  formHistory:[]
 
};

const RestoreFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CONSTANTS.RESTORE_FORM_ID:
      return { ...state, restoredFormId: action.payload };
    case ACTION_CONSTANTS.RESTORE_FORM_DATA:
      return { ...state, restoredFormData: action.payload };
    case ACTION_CONSTANTS.FORM_HISTORY:
      return { ...state, formHistory: action.payload };
    default:
      return state;
  }
};
export default RestoreFormReducer;
