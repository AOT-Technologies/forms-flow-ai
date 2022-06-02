import ACTION_CONSTANTS from "./actionConstants";

export const setLanguage = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.SET_LANGUAGE,
    payload: data,
  });
};
