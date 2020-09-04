import { httpGETRequest, httpPOSTRequest } from "../httpRequestHandler";
import API from "../endpoints";
import {
  setProcessStatusLoading,
  setProcessList,
  setProcessLoadError,
  setAllProcessList,
} from "../../actions/processActions";
import { replaceUrl } from "../../helper/helper";
import UserService from "../../services/UserService";

export const getProcessStatusList = (processId, taskId) => {
  return (dispatch) => {
    dispatch(setProcessStatusLoading(true));
    dispatch(setProcessLoadError(false));
    const apiUrlProcessId = replaceUrl(
      API.PROCESS_STATE,
      "<process_key>",
      processId
    );

    const apiURLWithtaskId = replaceUrl(apiUrlProcessId, "<task_key>", taskId);

    httpGETRequest(apiURLWithtaskId)
      .then((res) => {
        if (res.data) {
          dispatch(setProcessStatusLoading(false));
          dispatch(setProcessList(res.data.status));
        } else {
          dispatch(setProcessStatusLoading(false));
          dispatch(setProcessList([]));
          dispatch(setProcessLoadError(true));
        }
      })
      .catch((error) => {
        dispatch(setProcessStatusLoading(false));
        dispatch(setProcessLoadError(true));
      });
  };
};

/**
 * 
 * @param  {...any} rest 
 */
export const fetchAllBpmProcesses = (...rest) => {
  const done = rest.length ? rest[0] : () => { };
  return (dispatch) => {
      //httpGETRequest(API.GET_ALL_PROCESSES, {}, UserService.getToken(), true)
      httpGETRequest('http://localhost:5000/process', {}, UserService.getToken(), true)
      .then((res) => {
        if (res.data) {
          dispatch(setAllProcessList(res.data.process));
          done(null, res.data);
        } else {
          dispatch(setAllProcessList([]));
          dispatch(setProcessLoadError(true));
        }
      })
      .catch((error) => {
       // dispatch(setProcessStatusLoading(false));
        dispatch(setProcessLoadError(true));
      });
  };
};



