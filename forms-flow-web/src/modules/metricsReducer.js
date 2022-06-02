import ACTION_CONSTANTS from "../actions/actionConstants";
import {
  getPaginatedForms,
  getSearchResults,
} from "../apiManager/services/metricsServices";

const initialState = {
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
    case ACTION_CONSTANTS.METRICS_SUBMISSIONS:{
      const data = action.payload;
      return {
        ...state,
        submissionsList: getPaginatedForms(data, 1, state.limit, state.sort),
        submissionsFullList: data,
        pagination: {
          numPages: Math.ceil(action.payload.length / state.limit),
          page: state.pagination.page,
          total: action.payload.length,
        },
      };
    }
    case ACTION_CONSTANTS.METRICS_SUBMISSIONS_SEARCH:{
      const searchResult = getSearchResults(
        state.submissionsFullList,
        action.payload
      );
      return {
        ...state,
        searchText: action.payload,
        submissionsList: getPaginatedForms(
          searchResult,
          1,
          state.limit,
          state.sort
        ),
        submissionsSearchList: searchResult,
        submissionsFullList: state.submissionsFullList,
        pagination: {
          numPages: Math.ceil(searchResult.length / state.limit),
          page: 1,
          total: searchResult.length,
        },
      };
    }
    case ACTION_CONSTANTS.METRICS_SUBMISSIONS_SORT_CHANGE:
      return {
        ...state,
        sort: action.payload,
        submissionsList: state.searchText
          ? getPaginatedForms(
              state.submissionsSearchList,
              1,
              state.limit,
              action.payload
            )
          : getPaginatedForms(
              state.submissionsFullList,
              1,
              state.limit,
              action.payload
            ),
        pagination: { ...state.pagination, page: 1 },
      };
    case ACTION_CONSTANTS.METRICS_SUBMISSIONS_LIST_LIMIT_CHANGE:{
      const totalLength = state.searchText
        ? state.submissionsSearchList.length
        : state.submissionsFullList.length;
      return {
        ...state,
        limit: action.payload,
        submissionsList: state.searchText
          ? getPaginatedForms(
              state.submissionsSearchList,
              1,
              action.payload,
              state.sort
            )
          : getPaginatedForms(
              state.submissionsFullList,
              1,
              action.payload,
              state.sort
            ),
        pagination: {
          numPages: Math.ceil(totalLength / action.payload),
          page: 1,
          total: state.submissionsFullList.length,
        },
      };
    }
    case ACTION_CONSTANTS.METRICS_SUBMISSIONS_LIST_PAGE_CHANGE:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...{
            page: action.payload,
          },
        },
        submissionsList: state.searchText
          ? getPaginatedForms(
              state.submissionsSearchList,
              action.payload,
              state.limit,
              state.sort
            )
          : getPaginatedForms(
              state.submissionsFullList,
              action.payload,
              state.limit,
              state.sort
            ),
      };
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
