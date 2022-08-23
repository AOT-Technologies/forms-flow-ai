import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  isProcessLoading: true,
  processStatusList: [],
  processLoadError: false,
  processList: [],
  dmnProcessList: [],
  formProcessError: false,
  formProcessList: [],
  formPreviousData: [],
  processActivityList: null,
  processDiagramXML: "",
  processActivityLoadError: false,
  isProcessDiagramLoading: true,
  applicationCount: 0,
  isApplicationCountLoading: false,
  applicationCountResponse: false,
  unPublishApiError: false,
  workflowAssociated: null, //{label:'Workflow Name', value:'workflow_process_key'}
  formStatusLoading:false,
};

const process = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CONSTANTS.IS_PROCESS_STATUS_LOADING:
      return { ...state, isProcessLoading: action.payload };
    case ACTION_CONSTANTS.PROCESS_STATUS_LIST:
      return { ...state, processStatusList: action.payload };
    case ACTION_CONSTANTS.IS_PROCESS_STATUS_LOAD_ERROR:
      return { ...state, processLoadError: action.payload };
    case ACTION_CONSTANTS.IS_PROCESS_ACTIVITY_LOAD_ERROR:
      return { ...state, processActivityLoadError: action.payload };
    case ACTION_CONSTANTS.PROCESS_LIST:
      return { ...state, processList: action.payload };
    case ACTION_CONSTANTS.DMN_PROCESS_LIST:
      return { ...state, dmnProcessList: action.payload };
    case ACTION_CONSTANTS.IS_FORM_PROCESS_STATUS_LOAD_ERROR:
      return { ...state, formProcessError: action.payload };
    case ACTION_CONSTANTS.FORM_PROCESS_LIST:
      return {
        ...state,
        formProcessList: action.payload,
        workflowAssociated: action.payload?.processKey
          ? {
              label: action.payload?.processName,
              value: action.payload?.processKey,
              tenant: action.payload?.processTenant,
            }
          : null,
      };
    case ACTION_CONSTANTS.PROCESS_ACTIVITIES:
      return { ...state, processActivityList: action.payload };
    case ACTION_CONSTANTS.PROCESS_DIAGRAM_XML:
      return { ...state, processDiagramXML: action.payload };
    case ACTION_CONSTANTS.IS_PROCESS_DIAGRAM_LOADING:
      return { ...state, isProcessDiagramLoading: action.payload };
    case ACTION_CONSTANTS.FORM_PREVIOUS_DATA:
      return { ...state, formPreviousData: action.payload };
    case ACTION_CONSTANTS.APPLICATION_COUNT:
      return { ...state, applicationCount: action.payload };
    case ACTION_CONSTANTS.IS_APPLICATION_COUNT_LOADING:
      return { ...state, isApplicationCountLoading: action.payload };
    case ACTION_CONSTANTS.APPLICATION_COUNT_RESPONSE:
      return { ...state, applicationCountResponse: action.payload };
    case ACTION_CONSTANTS.UNPUBLISH_API_ERROR:
      return { ...state, unPublishApiError: action.payload };
    case ACTION_CONSTANTS.RESET_PROCESS:
      return {
        ...state,
        formPreviousData: [],
        formProcessList: [],
        processDiagramXML: "",
        isProcessDiagramLoading: true,
        applicationCount: 0,
        applicationCountResponse: false,
      };
    case ACTION_CONSTANTS.WORKFLOW_ASSOCIATION_CHANGED:
      return { ...state, workflowAssociated: action.payload };
    case ACTION_CONSTANTS.FORM_STATUS_LOADING:
      return { ...state, formStatusLoading: action.payload };
    default:
      return state;
  }
};

export default process;
