/* istanbul ignore file */
import ACTION_CONSTANTS from "./actionConstants";

export const setDraftSubmission = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.SAVE_DRAFT_DATA,
    payload: data,
  });
};

export const setDraftSubmissionError = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.DRAFT_SUBMISSION_ERROR,
    payload: data,
  });
};

export const setDraftlist = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.DRAFT_LIST,
    payload: data,
  });
};

export const setDraftDetail = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.DRAFT_DETAIL,
    payload: data,
  });
};

export const setDraftCount = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.DRAFT_COUNT,
    payload: data,
  });
};

export const setDraftListLoader = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.DRAFT_LIST_LOADER,
    payload: data,
  });
};

export const setDraftListActivePage = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.SET_DRAFT_LIST_ACTIVE_PAGE,
    payload: data,
  });
};

export const setCountPerpage = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.SET_DRAFT_COUNT_PER_PAGE,
    payload: data,
  });
};

export const setDraftDetailStatusCode = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.DRAFT_DETAIL_STATUS_CODE,
    payload: data,
  });
};

export const saveLastUpdatedDraft = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.DRAFT_LAST_UPDATED,
    payload: data,
  });
};
