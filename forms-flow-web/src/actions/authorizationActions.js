import ACTION_CONSTANTS from "./actionConstants";

export const setUserGroups = (data) => (dispatch) => {
    dispatch({
      type: ACTION_CONSTANTS.SET_USER_GROUPS,
      payload: data,
    });
  };
  
  export const setDesignerGroups = (data) => (dispatch) => {
    dispatch({
      type: ACTION_CONSTANTS.SET_DESIGNER_GROUPS,
      payload: data,
    });
  };

  export const setClientGroups = (data) => (dispatch) => {
    dispatch({
      type: ACTION_CONSTANTS.SET_CLIENT_GROUPS,
      payload: data,
    });
  };