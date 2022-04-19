import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  isMetricsLoading: true,
  submissionsList: [],
  submissionsStatusList: [],
  isMetricsStatusLoading: true,
  selectedMetricsId: 0,
  metricsLoadError: false,
  metricsStatusLoadError: false
};

const metrics = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CONSTANTS.IS_METRICS_LOADING:
      return { ...state, isMetricsLoading: action.payload };
    case ACTION_CONSTANTS.IS_METRICS_STATUS_LOADING:
      return { ...state, isMetricsStatusLoading: action.payload };
    case ACTION_CONSTANTS.METRICS_SUBMISSIONS:
      return { ...state, submissionsList: action.payload };
    case ACTION_CONSTANTS.METRICS_SUBMISSIONS_STATUS:
      return { ...state, submissionsStatusList: action.payload };
    case ACTION_CONSTANTS.SELECTED_METRICS_ID:
      return { ...state, selectedMetricsId: action.payload };
    case ACTION_CONSTANTS.METRICS_LOAD_ERROR:
      return { ...state, metricsLoadError: action.payload };
    case ACTION_CONSTANTS.METRICS_STATUS_LOAD_ERROR:
      return { ...state, metricsStatusLoadError: action.payload };
    default:
      return state;
  }
};


export default metrics;
