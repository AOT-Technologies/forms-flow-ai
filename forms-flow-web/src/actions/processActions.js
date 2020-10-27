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

export const setAllProcessList = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.PROCESS_LIST,
    payload: data,
  });
};

export const setApplicationAuditList = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.APPLICATION_AUDIT_LIST,
    payload: data,
  });
};

export const setFormProcessLoadError = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.IS_FORM_PROCESS_STATUS_LOAD_ERROR,
    payload: data,
  });
};

export const setFormProcessesData = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.FORM_PROCESS_LIST,
    payload: data,
  });
};

export const setProcessActivityData = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.PROCESS_ACTIVITIES,
    payload: data,
  });
};

export const setProcessDiagramXML = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.PROCESS_DIAGRAM_XML,
    payload: data,
  });
};

export const setProcessDiagramLoading = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.IS_PROCESS_DIAGRAM_LOADING,
    payload: data,
  });
};

