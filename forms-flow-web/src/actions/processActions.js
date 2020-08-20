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


export const setApplicationAuditList = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.APPLICATION_AUDIT_LIST,
    payload: data,
  });
};