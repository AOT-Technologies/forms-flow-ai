import ACTION_CONSTANTS from "./actionConstants";

export const setRoleIds = (data) => (dispatch) => {
    dispatch({
      type: ACTION_CONSTANTS.ROLE_IDS,
      payload: data,
    });
  };

export const setAccessForForm = (data) => (dispatch) => {
    dispatch({
        type: ACTION_CONSTANTS.ACCESS_ADDING,
        payload: data,
    });
};