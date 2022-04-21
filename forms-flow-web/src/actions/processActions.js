 /* istanbul ignore file */
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


export const setProcessActivityLoadError = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.IS_PROCESS_ACTIVITY_LOAD_ERROR,
    payload: data,
  });
};

export const setAllProcessList = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.PROCESS_LIST,
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

export const setFormPreviosData = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.FORM_PREVIOUS_DATA,
    payload: data,
  });
};

export const setApplicationCount = (data)=>dispatch=>{
  dispatch({
    type:ACTION_CONSTANTS.APPLICATION_COUNT,
    payload:data
  });
};

export const setIsApplicationCountLoading = (data)=>dispatch=>{
  dispatch({
    type:ACTION_CONSTANTS.IS_APPLICATION_COUNT_LOADING,
    payload:data
  });
};

export const setApplicationCountResponse = (data)=>dispatch=>{
  dispatch({
    type:ACTION_CONSTANTS.APPLICATION_COUNT_RESPONSE,
    payload:data
  });
};

export const setUnPublishApiError = (data)=>dispatch=>{
  dispatch({
    type:ACTION_CONSTANTS.UNPUBLISH_API_ERROR,
    payload:data
  });
};

export const setResetProcess = (data)=>dispatch=>{
  dispatch({
    type:ACTION_CONSTANTS.RESET_PROCESS,
    payload:data
  });
};
