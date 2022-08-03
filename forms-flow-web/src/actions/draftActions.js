/* istanbul ignore file */
import ACTION_CONSTANTS from "./actionConstants";

export const setDraftSubmission = (data) => (dispatch) => {
    dispatch({
      type: ACTION_CONSTANTS.SAVE_DRAFT_DATA,
      payload: data,
    });
  };