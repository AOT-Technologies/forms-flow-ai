import ACTION_CONSTANTS from "./actionConstants";

export const setBundleSelectedForms = (data) => (dispatch) => {
    dispatch({
      type: ACTION_CONSTANTS.BUNDLE_SELECTED_FORMS,
      payload: data,
    });
  };

  export const setBundleRules = (data) => (dispatch) => {
      dispatch({
        type: ACTION_CONSTANTS.BUNDLE_RULES,
        payload: data,
      });
    };