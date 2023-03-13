import ACTION_CONSTANTS from "./actionConstants";

export const setBundleSelectedForms = (data) => (dispatch) => {
    dispatch({
      type: ACTION_CONSTANTS.BUNDLE_SELECTED_FORMS,
      payload: data,
    });
  };

 

  
export const setBundleForms = (data) => (dispatch) => {
      dispatch({
        type: ACTION_CONSTANTS.BUNDLE_FORM_LIST,
        payload: data,
      });
    };


export const setBundleFormListLoading = (data) => (dispatch) => {
      dispatch({
        type: ACTION_CONSTANTS.BUNDLE_FORM_LIST_LOADING,
        payload: data,
      });
    };

export const setBundleFormListPage = (data) => (dispatch) => {
      dispatch({
        type: ACTION_CONSTANTS.BUNDLE_FORM_LIST_PAGE_CHANGE,
        payload: data,
      });
    };

export const setBundleFormSearch = (data) => (dispatch) => {
      dispatch({
        type: ACTION_CONSTANTS.BUNDLE_FORM__LIST_FORM_SEARCH,
        payload: data,
      });
    };
 
 

export const resetBundleData = (data) => (dispatch) => {
      dispatch({
        type: ACTION_CONSTANTS.BUNDLE_RESET,
        payload: data,
      });
    };