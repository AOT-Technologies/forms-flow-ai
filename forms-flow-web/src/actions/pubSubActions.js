import ACTION_CONSTANTS from "./actionConstants";

export const initPubSub = (data) => (dispatch) => {
    dispatch({
      type: ACTION_CONSTANTS.SET_PUB_SUB_INSTANCE,
      payload: data,
    });
  };

