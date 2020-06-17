import { httpGETRequest, httpPOSTRequest } from "../httpRequestHandler";
import API from "../endpoints";
import {
  setTaskList,
  setTaskCount,
  serviceActionError,
  setLoader,
  setTaskDetail,
} from "../../actions/taskActions";
import { taskSubmissionFormatter } from "./formatterService";
import UserService from "../../services/UserService";

export const fetchTaskList = (...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    httpGETRequest(API.GET_TASK_API, {}, UserService.getToken())
      .then((res) => {
        if (res.data) {
          const tasks = res.data.tasks;
          let data = tasks.map((task) => {
            const taskData = taskSubmissionFormatter(task.variables);
            delete task.variables;
            return { ...task, ...taskData };
          });
          dispatch(setTaskList(data));
          dispatch(setLoader(false));
          done(null, res.data);
        } else {
          console.log("Error", res);
          dispatch(serviceActionError(res));
          dispatch(setLoader(false));
        }
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(serviceActionError(error));
        dispatch(setLoader(false));
        done(error);
      });
  };
};

export const getTaskDetail = (id, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    httpGETRequest(
      `${API.GET_TASK_DETAIL_API + id}`,
      {},
      UserService.getToken()
    )
      .then((res) => {
        if (res.data) {
          const task = res.data.task[0];
          const taskVariables = taskSubmissionFormatter(task.variables);
          delete task.variables;
          let taskDetail = { ...task, ...taskVariables };
          dispatch(setTaskDetail(taskDetail));
          dispatch(setLoader(false));
          done(null, taskDetail);
        }
      })
      .catch((error) => {
        dispatch(serviceActionError(error));
        dispatch(setLoader(false));
        done(error);
      });
  };
};

// export const fetchTaskList = (...rest) =>{
//   const done = rest.length ? rest[0] :  ()=>{};
//   return dispatch => {
//     httpPOSTRequest(API.GET_TASK_API,{"taskVariables":[]}).then(res => {
//       if (res.data) {
//         dispatch(setTaskList(res.data))
//         dispatch(setLoader(false))
//         done(null,res.data);
//       } else {
//         console.log('Error',res);
//         dispatch(serviceActionError(res))
//         dispatch(setLoader(false))
//       }
//     }).catch((error) => {
//       console.log('Error',error);
//       dispatch(serviceActionError(error))
//       dispatch(setLoader(false))
//       done(error);
//     })
//   }
// }
// export const getTaskCount = () =>{
//   return dispatch => {
//     httpPOSTRequest(API.GET_TASK_COUNT,{"taskVariables":[]}).then(res => {
//       if (res.data) {
//         dispatch(setTaskCount(res.data))
//       } else {
//         console.log('Error',res);
//         dispatch(serviceActionError(res))
//       }
//     }).catch((error) => {
//       console.log('Error',error);
//       dispatch(serviceActionError(error))
//     })
//   }
// }

// export const getTaskDetail = (id, ...rest) =>{
//   const done = rest.length ? rest[0] :  ()=>{};
//   return dispatch=>{
//     httpGETRequest(`${API.GET_TASK_DETAIL_API}${id}`).then(res=>{
//       if(res.status === 200){
//         dispatch(setTaskDetail(res.data[0]))
//         dispatch(setLoader(false))
//         done(null,res.data[0]);
//       }
//     })
//       .catch(error=>{
//         dispatch(serviceActionError(error))
//         dispatch(setLoader(false))
//         done(error);
//       })
//   }
// }

export const getTaskSubmissionDetails = (id, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    httpGETRequest(`${API.GET_TASK_SUBMISSION_DATA}${id}`)
      .then((res) => {
        if (res.status === 200) {
          const taskData = taskSubmissionFormatter(res.data);
          done(null, taskData);
        }
      })
      .catch((error) => {
        dispatch(serviceActionError(error));
        done(error);
      });
  };
};

export const claimTask = (id, user, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    httpPOSTRequest(`${API.GET_TASK_API}/${id}/claim`, { userId: user })
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
export const unClaimTask = (id, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    httpPOSTRequest(`${API.GET_TASK_API}/${id}/unclaim`)
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
export const completeTask = (id, reviewStatus, ...rest) => {
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
        dispatch(getTaskDetail(id));
        done(null, res);
      })
      .catch((error) => {
        console.log("Error", error);
        done(error);
        dispatch(serviceActionError(error));
      });
  };
};
