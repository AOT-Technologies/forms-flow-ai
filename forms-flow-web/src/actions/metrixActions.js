import ACTION_CONSTANTS from "./actionConstants";

export const setMetrixSubmissionCount = (data) => (dispatch) => {
  console.log("actions data", data);
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

export const setFormSubmissionError = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.FORM_SUBMISSION_ERROR,
    payload: data,
  });
};
export const setFormDeleteStatus = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.FORM_DELETE,
    payload: data,
  });
};
