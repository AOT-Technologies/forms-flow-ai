import ACTION_CONSTANTS from "./actionConstants";

export const setUserGroups = (data) => (dispatch) => {
    dispatch({
      type: ACTION_CONSTANTS.SET_USER_GROUPS,
      payload: data,
    });
  };
  