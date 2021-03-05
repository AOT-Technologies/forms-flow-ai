import {httpGETRequest, httpPOSTRequest, httpPUTRequest} from "../httpRequestHandler";
import API from "../endpoints";
import UserService from "../../services/UserService";
import {
  setBPMTaskLoader,
  setBPMTaskList,
  serviceActionError,
  setBPMTaskDetailLoader,
  setBPMTaskDetail,
  setBPMProcessList,
  setBPMUserList,
  setBPMTaskDetailUpdating,
  setBPMFilterList, setBPMFilterLoader
} from "../../actions/bpmTaskActions";
import {replaceUrl} from "../../helper/helper";
import axios from "axios";
import {taskDetailVariableDataFormatter} from "./formatterService";

export const fetchServiceTaskList = (filterId,...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const apiUrlgetTaskList = replaceUrl(
    API.GET_BPM_TASK_LIST_WITH_FILTER,
    "<filter_id>",
    filterId
  );
  return (dispatch) => {
    httpPOSTRequest(apiUrlgetTaskList, {"sorting":
        [{"sortBy": "created",
          "sortOrder": "desc"
        }]
    }, UserService.getToken())
      .then((res) => {
        if (res.data) {
          dispatch(setBPMTaskList(res.data));
          dispatch(setBPMTaskLoader(false));
          done(null, res.data);
        } else {
          console.log("Error", res);
          dispatch(serviceActionError(res));
          dispatch(setBPMTaskLoader(false));
        }
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(serviceActionError(error));
        dispatch(setBPMTaskLoader(false));
        done(error);
      });
  };
};

export const fetchProcessDefinitionList = (...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    httpGETRequest(API.GET_BPM_PROCESS_LIST, {}, UserService.getToken())
      .then((res) => {
        if (res.data) {
          dispatch(setBPMProcessList(res.data));
          //dispatch(setBPMLoader(false));
          done(null, res.data);
        } else {
          console.log("Error", res);
          dispatch(serviceActionError(res));
          //dispatch(setBPMTaskLoader(false));
        }
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(serviceActionError(error));
        //dispatch(setBPMTaskLoader(false));
        done(error);
      });
  };
};

export const fetchUserList = (...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    httpGETRequest(API.GET_BPM_USER_LIST, {}, UserService.getToken())
      .then((res) => {
        if (res.data) {
          dispatch(setBPMUserList(res.data));
          //dispatch(setBPMLoader(false));
          done(null, res.data);
        } else {
          console.log("Error", res);
          dispatch(serviceActionError(res));
          //dispatch(setBPMTaskLoader(false));
        }
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(serviceActionError(error));
        //dispatch(setBPMTaskLoader(false));
        done(error);
      });
  };
};

export const fetchFilterList = (...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const getTaskFiltersAPI = `${API.GET_BPM_FILTERS}?resourceType=Task&itemCount=true`
  return (dispatch) => {
    httpGETRequest(getTaskFiltersAPI, {}, UserService.getToken())
      .then((res) => {
        if (res.data) {
          dispatch(setBPMFilterList(res.data));
          dispatch(setBPMFilterLoader(false));
          //dispatch(setBPMLoader(false));
          done(null, res.data);
        } else {
          console.log("Error", res);
          dispatch(setBPMFilterLoader(false));
          dispatch(serviceActionError(res));
          //dispatch(setBPMTaskLoader(false));
        }
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(setBPMFilterLoader(false));
        dispatch(serviceActionError(error));
        //dispatch(setBPMTaskLoader(false));
        done(error);
      });
  };
};

export const getBPMTaskDetail = (taskId, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const apiUrlgetTaskDetail = replaceUrl(
    API.GET_BPM_TASK_DETAIL,
    "<task_id>",
    taskId
  );

  const apiUrlgetTaskVariables = replaceUrl(
    API.GET_BPM_TASK_VARIABLES,
    "<task_id>",
    taskId
  );

  const taskDetailReq =   httpGETRequest(apiUrlgetTaskDetail);
  const taskDetailsWithVariableReq =   httpGETRequest(apiUrlgetTaskVariables);


  return (dispatch) => {
    axios.all([taskDetailReq,taskDetailsWithVariableReq])
      .then(axios.spread(
        (...responses) => {
        if (responses[0]?.data) {
          let taskDetail=responses[0].data;
          if(responses[1]?.data){
            let taskDetailUpdates = responses[1]?.data;
            taskDetail = {...taskDetail,...taskDetailVariableDataFormatter(taskDetailUpdates)};
          }
          dispatch(setBPMTaskDetail(taskDetail));
          dispatch(setBPMTaskDetailLoader(false));
          dispatch(setBPMTaskDetailUpdating(false));
          done(null, taskDetail);
        }
      }))
      .catch((error) => {
         dispatch(serviceActionError(error));
         dispatch(setBPMTaskDetailLoader(false));
        done(error);
      });
  };
};


export const claimBPMTask = (taskId, user, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const apiUrlClaimTask = replaceUrl(
    API.CLAIM_BPM_TASK,
    "<task_id>",
    taskId
  );
  return (dispatch) => {
    httpPOSTRequest(apiUrlClaimTask, { userId: user })
      .then((res) => {
        // if (res.status === 200) {
        //TODO REMOVE
        done(null, res.data);
        // }
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(serviceActionError(error));
        done(error);
      });
  };
};


export const updateBPMTask = (taskId, task, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const taskDetailAPI = replaceUrl(
    API.GET_BPM_TASK_DETAIL,
    "<task_id>",
    taskId
  );
  return (dispatch) => {
    httpPUTRequest(taskDetailAPI, task)
      .then((res) => {
        // if (res.status === 200) {
        //TODO REMOVE
        done(null, res.data);
        // }
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(serviceActionError(error));
        done(error);
      });
  };
};


export const unClaimBPMTask = (taskId, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const apiUrlUnClaimTask = replaceUrl(
    API.UNCLAIM_BPM_TASK,
    "<task_id>",
    taskId
  );
  return (dispatch) => {
    httpPOSTRequest(apiUrlUnClaimTask)
      .then((res) => {
        // if (res.status === 204) {
        //TODO REMOVE
        done(null, res.data);
        // }
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(serviceActionError(error));
        done(error);
      });
  };
};

/*export const completeTask = (id, reviewStatus, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const data = {
    variables: {
      action: {
        value: reviewStatus,
      },
    },
  };
  return (dispatch) => {
    httpPOSTRequest(`${API.GET_TASK_API}/${id}/complete`, data)
      .then((res) => {
        /!*dispatch(getTaskDetail(id));
        done(null, res);*!/
      })
      .catch((error) => {
        console.log("Error", error);
        done(error);
        dispatch(serviceActionError(error));
      });
  };
};*/
