import ACTION_CONSTANTS from "./actionConstants";

export const setMetrixSubmissionCount = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.METRIXSUBMISSIONS,
    payload: data,
  });
};

export const setMetrixLoader = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.IS_METRIX_LOADING,
    payload: data,
  });
};

export const setMetrixSubmissionStatusCount = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.METRIX_SUBMISSIONS_STATUS,
    payload: data,
  });
};
export const setMetrixStatusLoader = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.IS_METRIX_STATUS_LOADING,
    payload: data,
  });
};
export const setSelectedMetrixId = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.SELECTED_METRIX_ID,
    payload: data,
  });
};

export const setMetrixLoadError = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.METRIX_LOAD_ERROR,
    payload: data,
  });
};
export const setMetrixStatusLoadError = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.METRIX_STATUS_LOAD_ERROR,
    payload: data,
  });
};
