import ACTION_CONSTANTS from "../actions/actionConstants";
const initialState = {
  sortOrder: 'asc',
  totalItems: 0,
  isMetricsLoading: true,
  submissionsList: [],
  submissionsSearchList: [],
  submissionsFullList: [],
  submissionsStatusList: [],
  isMetricsStatusLoading: true,
  selectedMetricsId: 0,
  metricsLoadError: false,
  metricsStatusLoadError: false,
  limit: 6,
  pageno: 1,
  pagination: {
    numPages: 0,
    page: 1,
    total: 0,
  },
  sort: "formName",
  searchText: "",
  maintainPagination: false,
  metricsDateRangeLoader: false,
  submissionStatusCountLoader: false,
};

const metrics = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CONSTANTS.IS_METRICS_LOADING:
      return { ...state, isMetricsLoading: action.payload };
    case ACTION_CONSTANTS.IS_METRICS_STATUS_LOADING:
      return { ...state, isMetricsStatusLoading: action.payload };
    case ACTION_CONSTANTS.METRICS_SUBMISSIONS:
      return { ...state, submissionsList: action.payload };
      case ACTION_CONSTANTS.METRICS_SUBMISSIONS_COUNT:
      return { ...state, totalItems: action.payload };
    case ACTION_CONSTANTS.METRICS_SUBMISSIONS_SEARCH:
      return { ...state, searchText: action.payload };
    case ACTION_CONSTANTS.METRICS_SUBMISSIONS_SORT_CHANGE:
      return { ...state, sortOrder: action.payload };
    case ACTION_CONSTANTS.METRICS_SUBMISSIONS_LIST_PAGE_CHANGE:
      return { ...state, pageno: action.payload };
    case ACTION_CONSTANTS.METRICS_SUBMISSIONS_LIST_LIMIT_CHANGE:
      return { ...state, limit: action.payload };
    case ACTION_CONSTANTS.METRICS_SUBMISSIONS_STATUS:
      return { ...state, submissionsStatusList: action.payload };
    case ACTION_CONSTANTS.SELECTED_METRICS_ID:
      return { ...state, selectedMetricsId: action.payload };
    case ACTION_CONSTANTS.METRICS_LOAD_ERROR:
      return { ...state, metricsLoadError: action.payload };
    case ACTION_CONSTANTS.METRICS_STATUS_LOAD_ERROR:
      return { ...state, metricsStatusLoadError: action.payload };
    case ACTION_CONSTANTS.METRICS_DATE_RANGE_LOADING:
      return { ...state, metricsDateRangeLoader: action.payload };
    case ACTION_CONSTANTS.METRICS_SUBMISSION_RESET:
      return { ...state, metricsDateRangeLoader: action.payload };
    case ACTION_CONSTANTS.METRICS_SUBMISSION_STATUS_COUNT_LOADER:
      return { ...state, submissionStatusCountLoader: action.payload };
    default:
      return state;
      
  }
};

export default metrics;
