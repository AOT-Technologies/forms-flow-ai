import { httpGETRequest } from "../httpRequestHandler";
import API from "../endpoints";
import {
  setProcessStatusLoading,
  setProcessList,
  setProcessLoadError,
} from "../../actions/processActions";
import UserService from "../../services/UserService";

export const getProcessStatusList = (processId, taskId) => {
  return (dispatch) => {
    dispatch(setProcessStatusLoading(true));
    dispatch(setProcessLoadError(false));
    httpGETRequest(`${API.PROCESS_STATE}`, {}, UserService.getToken())
      .then((res) => {
        if (res.data) {
          dispatch(setProcessStatusLoading(false));
          dispatch(setProcessList(res.data));
        } else {
          dispatch(setProcessStatusLoading(false));
          dispatch(setProcessList([]));
          dispatch(setProcessLoadError(true));
        }
      })
      .catch((error) => {
        dispatch(setProcessStatusLoading(false));
        // dispatch(setProcessList([]));
        dispatch(setProcessLoadError(true));
      });
  };
};
