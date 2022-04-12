 /* istanbul ignore file */
import {httpGETRequest, httpPOSTRequest, httpPUTRequest, httpPOSTRequestWithHAL } from "../httpRequestHandler";
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
  setBPMFilterList, setBPMFilterLoader, updateBPMTaskGroups, setBPMTaskGroupsLoading, setBPMTaskCount
} from "../../actions/bpmTaskActions";
import {replaceUrl} from "../../helper/helper";
import axios from "axios";
import {taskDetailVariableDataFormatter} from "./formatterService";
import {REVIEWER_GROUP} from "../../constants/userContants";
import {MAX_RESULTS} from "../../components/ServiceFlow/constants/taskConstants";

export const fetchServiceTaskList = (filterId,firstResult,reqData,taskIdToRemove,...rest) => {
  const done = rest.length ? rest[0] : () => {};
  let apiUrlgetTaskList = replaceUrl(
    API.GET_BPM_TASK_LIST_WITH_FILTER,
    "<filter_id>",
    filterId
  );

  apiUrlgetTaskList=`${apiUrlgetTaskList}?firstResult=${firstResult}&maxResults=${MAX_RESULTS}`

  return (dispatch) => {
    httpPOSTRequestWithHAL(apiUrlgetTaskList, reqData, UserService.getToken())
      .then((res) => {
        if (res.data) {
          let responseData = res.data;
          const _embedded = responseData['_embedded']; // data._embedded.task is where the task list is.
          if (!_embedded || !_embedded['task'] || !responseData['count']) {
            // Display error if the necessary values are unavailable.
            // console.log("Error", res);
            dispatch(setBPMTaskList([]));
            dispatch(setBPMTaskCount(0));
            dispatch(serviceActionError(res));
            dispatch(setBPMTaskLoader(false));
          } else {
            const taskListFromResponse = _embedded['task']; // Gets the task array
            const taskCount = {
              count: responseData['count']
            };
            let taskData = taskListFromResponse;
            if(taskIdToRemove){
              // console.log("task----",taskIdToRemove);
              //if the list has the task with taskIdToRemove remove that task and decrement
              if(taskListFromResponse.find((task)=>task.id===taskIdToRemove)){
                taskData=taskListFromResponse.filter( (task)=>task.id!==taskIdToRemove);
                taskCount['count']--; // Count has to be decreased since one task id is removed.
              }
            }
            dispatch(setBPMTaskCount(taskCount));
            dispatch(setBPMTaskList(taskData));
            dispatch(setBPMTaskLoader(false));
            done(null, taskData);
          }
        } else {
          // console.log("Error", res);
          dispatch(setBPMTaskList([]));
          dispatch(setBPMTaskCount(0));
          dispatch(serviceActionError(res));
          dispatch(setBPMTaskLoader(false));
        }
      })
      .catch((error) => {
        // console.log("Error", error);
        dispatch(setBPMTaskList([]));
        dispatch(setBPMTaskCount(0));
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
  /*TODO search with query /user?lastNameLike=%${lastName}%&memberOfGroup=${group}*/
  const getReviewerUserListApi = `${API.GET_BPM_USER_LIST}?memberOfGroup=${REVIEWER_GROUP}`;
  return (dispatch) => {
    httpGETRequest(getReviewerUserListApi, {}, UserService.getToken())
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

export const fetchUserListWithSearch = ({searchType,query},...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const paramData={memberOfGroup:REVIEWER_GROUP};
  /*TODO search with query /user?lastNameLike=%${lastName}%&memberOfGroup=${group}*/
  //let getReviewerUserListApi = `${API.GET_BPM_USER_LIST}?memberOfGroup=${REVIEWER_GROUP}`;
  if(searchType && query){
    //getReviewerUserListApi = `${getReviewerUserListApi}&${searchType}=%${query||""}%`
    paramData[searchType]=`%${query}%`;
  }

  return (dispatch) => {
    httpGETRequest(API.GET_BPM_USER_LIST, paramData, UserService.getToken())
      .then((res) => {
        if (res.data) {
          dispatch(setBPMUserList(res.data));
          //dispatch(setBPMLoader(false));
          done(null, res.data);
        } else {
          done(null, []);
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
        dispatch(setBPMTaskDetailUpdating(false));
        done(error);
      });
  };
};


export const getBPMGroups = (taskId, ...rest) => {
  const done = rest.length ? rest[0] : () => {};

  const apiUrlgetGroups = replaceUrl(
    API.BPM_GROUP,
    "<task_id>",
    taskId
  );

  return (dispatch) => {
    httpGETRequest(`${apiUrlgetGroups}?type=candidate`)
      .then(responses => {
            if (responses?.data){
              const groups = responses.data;
              dispatch(updateBPMTaskGroups(groups));
              done(null, groups);
            }else{
              dispatch(setBPMTaskGroupsLoading(false));
              done(null,[]);
            }
          }
        )
      .catch((error) => {
        dispatch(serviceActionError(error));
        dispatch(setBPMTaskGroupsLoading(false));
        done(error);
      });
  };
};

export const removeBPMGroup = (taskId, group, ...rest) => {
  const done = rest.length ? rest[0] : () => {};

  const apiUrlDeleteGroup = replaceUrl(
    API.DELETE_BPM_GROUP,
    "<task_id>",
    taskId
  );

  return (dispatch) => {
    httpPOSTRequest(apiUrlDeleteGroup, group)
      .then(responses => {
          if (responses?.data){
            dispatch(setBPMTaskDetailLoader(false));
            dispatch(setBPMTaskDetailUpdating(false));
            done(null, responses?.data);
          }else{
            dispatch(setBPMTaskDetailLoader(false));
            dispatch(setBPMTaskDetailUpdating(false));
            done(null,[]);
          }
        }
      )
      .catch((error) => {
        dispatch(serviceActionError(error));
        dispatch(setBPMTaskDetailLoader(false));
        dispatch(setBPMTaskDetailUpdating(false));
        done(error);
      });
  };
};

export const addBPMGroup = (taskId, group, ...rest) => {
  const done = rest.length ? rest[0] : () => {};

  const apiUrlAddGroup = replaceUrl(
    API.BPM_GROUP,
    "<task_id>",
    taskId
  );

  return (dispatch) => {
    httpPOSTRequest(apiUrlAddGroup, group)
      .then(responses => {
          if (responses?.data){
            dispatch(setBPMTaskDetailLoader(false));
            dispatch(setBPMTaskDetailUpdating(false));
            done(null, responses?.data);
          }else{
            dispatch(setBPMTaskDetailLoader(false));
            dispatch(setBPMTaskDetailUpdating(false));
            done(null,[]);
          }
        }
      )
      .catch((error) => {
        dispatch(serviceActionError(error));
        dispatch(setBPMTaskDetailLoader(false));
        dispatch(setBPMTaskDetailUpdating(false));
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
        done(null, res.data);
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(serviceActionError(error));
        dispatch(setBPMTaskDetailUpdating(false));
        done(error);
      });
  };
};

export const updateAssigneeBPMTask = (taskId, user, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const apiUrlClaimTask = replaceUrl(
    API.UPDATE_ASSIGNEE_BPM_TASK,
    "<task_id>",
    taskId
  );
  return (dispatch) => {
    httpPOSTRequest(apiUrlClaimTask, { userId: user })
      .then((res) => {
        done(null, res.data);
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(serviceActionError(error));
        dispatch(setBPMTaskDetailUpdating(false));
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

export const onBPMTaskFormSubmit = (taskId, formReq, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const apiUrlOnFormSubmit = replaceUrl(
    API.BPM_FORM_SUBMIT,
    "<task_id>",
    taskId
  );
  return (dispatch) => {
    httpPOSTRequest(apiUrlOnFormSubmit,formReq)
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
