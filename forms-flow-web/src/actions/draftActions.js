/* istanbul ignore file */
import ACTION_CONSTANTS from "./actionConstants";

export const setDraftSubmission = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.SAVE_DRAFT_DATA,
    payload: data,
  });
};

export const setDraftlist = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.DRAFT_LIST,
    payload: data,
  });
};

export const setDraftDetail = (data) => (dispatch) =>{
  dispatch({
    type: ACTION_CONSTANTS.DRAFT_DETAIL,
    payload: data
  });
};
