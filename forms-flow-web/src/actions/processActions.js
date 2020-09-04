import ACTION_CONSTANTS from "./actionConstants";

export const setProcessList = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.PROCESS_STATUS_LIST,
    payload: data,
  });
};

export const setProcessStatusLoading = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.IS_PROCESS_STATUS_LOADING,
    payload: data,
  });
};

export const setProcessLoadError = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.IS_PROCESS_STATUS_LOAD_ERROR,
    payload: data,
  });
};

<<<<<<< HEAD
export const setAllProcessList = (data) => (dispatch) => {  
  dispatch({
    type: ACTION_CONSTANTS.PROCESS_LIST,
    payload: data,
  });
};
=======

export const setApplicationAuditList = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.APPLICATION_AUDIT_LIST,
    payload: data,
  });
};
>>>>>>> 83c0f406599b442bcf81a83580af6ed3ecfe8737
