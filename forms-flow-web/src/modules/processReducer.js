import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  isProcessLoading: true,
  processStatusList: [],
  processLoadError: false,
  processList: [],
  formProcessError: false,
  formProcessList: [],
  processActivityList: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CONSTANTS.IS_PROCESS_STATUS_LOADING:
      return { ...state, isProcessLoading: action.payload };
    case ACTION_CONSTANTS.PROCESS_STATUS_LIST:
      return { ...state, processStatusList: action.payload };
    case ACTION_CONSTANTS.IS_PROCESS_STATUS_LOAD_ERROR:
      return { ...state, processLoadError: action.payload };
    case ACTION_CONSTANTS.PROCESS_LIST:
      return { ...state, processList: action.payload };
    case ACTION_CONSTANTS.IS_FORM_PROCESS_STATUS_LOAD_ERROR:
      return { ...state, formProcessError: action.payload };
    case ACTION_CONSTANTS.FORM_PROCESS_LIST:
      return { ...state, formProcessList: action.payload };
    case ACTION_CONSTANTS.PROCESS_ACTIVITIES:
      return { ...state, processActivityList: action.payload };  
    default:
      return state;
  }
};
