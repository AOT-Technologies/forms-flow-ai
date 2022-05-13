 /* istanbul ignore file */
import ACTION_CONSTANTS from "./actionConstants";

export const setMetricsSubmissionCount = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.METRICS_SUBMISSIONS,
    payload: data,
  });
};

export const setMetricsLoader = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.IS_METRICS_LOADING,
    payload: data,
  });
};

export const setMetricsSubmissionStatusCount = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.METRICS_SUBMISSIONS_STATUS,
    payload: data,
  });
};
export const setMetricsStatusLoader = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.IS_METRICS_STATUS_LOADING,
    payload: data,
  });
};
export const setSelectedMetricsId = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.SELECTED_METRICS_ID,
    payload: data,
  });
};

export const setMetricsLoadError = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.METRICS_LOAD_ERROR,
    payload: data,
  });
};
export const setMetricsStatusLoadError = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.METRICS_STATUS_LOAD_ERROR,
    payload: data,
  });
};
export const setMetricsSubmissionSearch = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.METRICS_SUBMISSIONS_SEARCH,
    payload: data,
  });
};

export const setMetricsSubmissionSort = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.METRICS_SUBMISSIONS_SORT_CHANGE,
    payload: data,
  });
};

export const setMetricsSubmissionLimitChange = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.METRICS_SUBMISSIONS_LIST_LIMIT_CHANGE,
    payload: data,
  });
};
export const setMetricsSubmissionPageChange = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.METRICS_SUBMISSIONS_LIST_PAGE_CHANGE,
    payload: data,
  });
};

export const setMetricsDateRangeLoading = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.METRICS_DATE_RANGE_LOADING,
    payload: data,
  });
};