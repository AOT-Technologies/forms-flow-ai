/* istanbul ignore file */
import ACTION_CONSTANTS from "./actionConstants";

export const setApiCallError = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.API_CALL_ERROR,
    payload: data,
  });
};
