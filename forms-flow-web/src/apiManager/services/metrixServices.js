import { httpGETRequest } from "../httpRequestHandler";
// import API from "../endpoints";
import {
  setMetrixSubmissionCount,
  setMetrixLoader,
  setMetrixStatusLoader,
  setMetrixSubmissionStatusCount,
  setSelectedMetrixId,
} from "../../actions/metrixActions";
// import { taskSubmissionFormatter } from "./formatterService";

export const fetchMetrixSubmissionCount = (...rest) => {
  const done = rest.length ? rest[0] : () => {};
  console.log("insiude");
  return (dispatch) => {
    // httpPOSTRequest(API.GET_TASK_API, { taskVariables: [] })
    httpGETRequest("http://localhost:3004/applicationsMetrix", {})
      .then((res) => {
        console.log("res", res);
        if (res.data) {
          console.log("res.data[0].mapperId)", res.data[0].applications[0]);
          dispatch(setMetrixSubmissionCount(res.data));
          dispatch(setMetrixLoader(false));
          dispatch(
            fetchMetrixSubmissionStatusCount(
              res.data[0].applications[0].mapperId
            )
          );
          done(null, res.data);
        } else {
          console.log("Error", res);
          // dispatch(serviceActionError(res));
          dispatch(setMetrixLoader(false));
        }
      })
      .catch((error) => {
        console.log("Error", error);
        // dispatch(serviceActionError(error));
        dispatch(setMetrixLoader(false));
        done(error);
      });
  };
};

export const fetchMetrixSubmissionStatusCount = (id, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    dispatch(setSelectedMetrixId(id));
    // httpPOSTRequest(API.GET_TASK_API, { taskVariables: [] })
    httpGETRequest(`http://localhost:3004/statusMetrix/${id}`, {})
      .then((res) => {
        console.log("res", res.data);
        if (res.data) {
          dispatch(setMetrixSubmissionStatusCount(res.data.applicationStatus));
          dispatch(setMetrixStatusLoader(false));
          done(null, res.data);
        } else {
          console.log("Error", res);
          // dispatch(serviceActionError(res));
          dispatch(setMetrixStatusLoader(false));
        }
      })
      .catch((error) => {
        console.log("Error", error);
        // dispatch(serviceActionError(error));
        dispatch(setMetrixStatusLoader(false));
        done(error);
      });
  };
};
// export const getTaskCount = () => {
//   return (dispatch) => {
//     httpPOSTRequest(API.GET_TASK_COUNT, { taskVariables: [] })
//       .then((res) => {
//         if (res.data) {
//           dispatch(setTaskCount(res.data));
//         } else {
//           console.log("Error", res);
//           dispatch(serviceActionError(res));
//         }
//       })
//       .catch((error) => {
//         console.log("Error", error);
//         dispatch(serviceActionError(error));
//       });
//   };
// };

// export const getTaskDetail = (id, ...rest) => {
//   const done = rest.length ? rest[0] : () => {};
//   return (dispatch) => {
//     httpGETRequest(`${API.GET_TASK_DETAIL_API}${id}`)
//       .then((res) => {
//         if (res.status === 200) {
//           dispatch(setTaskDetail(res.data[0]));
//           dispatch(setLoader(false));
//           done(null, res.data[0]);
//         }
//       })
//       .catch((error) => {
//         dispatch(serviceActionError(error));
//         dispatch(setLoader(false));
//         done(error);
//       });
//   };
// };

// export const getTaskSubmissionDetails = (id, ...rest) => {
//   const done = rest.length ? rest[0] : () => {};
//   return (dispatch) => {
//     httpGETRequest(`${API.GET_TASK_SUBMISSION_DATA}${id}`)
//       .then((res) => {
//         if (res.status === 200) {
//           const taskData = taskSubmissionFormatter(res.data);
//           done(null, taskData);
//         }
//       })
//       .catch((error) => {
//         dispatch(serviceActionError(error));
//         done(error);
//       });
//   };
// };

// export const claimTask = (id, user, ...rest) => {
//   const done = rest.length ? rest[0] : () => {};
//   return (dispatch) => {
//     httpPOSTRequest(`${API.TASK_ACTION_API}/${id}/claim`, { userId: user })
//       .then((res) => {
//         if (res.status === 204) {
//           //TODO REMOVE
//           done(null, res.data);
//         }
//       })
//       .catch((error) => {
//         console.log("Error", error);
//         dispatch(serviceActionError(error));
//         done(error);
//       });
//   };
// };
// export const unClaimTask = (id, ...rest) => {
//   const done = rest.length ? rest[0] : () => {};
//   return (dispatch) => {
//     httpPOSTRequest(`${API.TASK_ACTION_API}/${id}/unclaim`)
//       .then((res) => {
//         if (res.status === 204) {
//           //TODO REMOVE
//           done(null, res.data);
//         }
//       })
//       .catch((error) => {
//         console.log("Error", error);
//         dispatch(serviceActionError(error));
//         done(error);
//       });
//   };
// };
// export const completeTask = (id, reviewStatus, ...rest) => {
//   const done = rest.length ? rest[0] : () => {};
//   const data = {
//     variables: {
//       action: {
//         value: reviewStatus,
//       },
//     },
//   };
//   return (dispatch) => {
//     httpPOSTRequest(`${API.TASK_ACTION_API}/${id}/complete`, data)
//       .then((res) => {
//         dispatch(getTaskDetail(id));
//         done(null, res);
//       })
//       .catch((error) => {
//         console.log("Error", error);
//         done(error);
//         dispatch(serviceActionError(error));
//       });
//   };
// };
