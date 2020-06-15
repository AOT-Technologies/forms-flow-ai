import { httpGETRequest } from "../httpRequestHandler";
import API from "../endpoints";
import {
  setMetrixSubmissionCount,
  setMetrixLoader,
  setMetrixStatusLoader,
  setMetrixSubmissionStatusCount,
  setSelectedMetrixId,
  setMetrixLoadError,
  setMetrixStatusLoadError,
} from "../../actions/metrixActions";

export const fetchMetrixSubmissionCount = (fromDate, toDate, ...rest) => {
  return (dispatch) => {
    dispatch(setMetrixLoadError(false));
    httpGETRequest(
      `${API.METRICS_SUBMISSIONS}?from=${fromDate}&to=${toDate}`,
      {}
    )
      .then((res) => {
        if (res.data) {
          dispatch(setMetrixSubmissionCount(res.data.applications));
          dispatch(setMetrixLoader(false));
          if (res.data.applications && res.data.applications[0]) {
            dispatch(
              fetchMetrixSubmissionStatusCount(
                res.data.applications[0].mapperId,
                fromDate,
                toDate
              )
            );
          } else {
            dispatch(setMetrixSubmissionStatusCount([]));
            dispatch(setMetrixStatusLoader(false));
          }
        } else {
          // TODO error handling
          console.log("Error", res);
          dispatch(setMetrixStatusLoader(false));
          dispatch(setMetrixLoadError(true));
          // dispatch(setMetrixLoader(false));
        }
      })
      .catch((error) => {
        // TODO error handling
        console.log("Error", error);
        // dispatch(serviceActionError(error));
        dispatch(setMetrixLoader(false));
        dispatch(setMetrixLoadError(true));
      });
  };
};

export const fetchMetrixSubmissionStatusCount = (id, fromDate, toDate) => {
  // const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    dispatch(setSelectedMetrixId(id));
    // httpPOSTRequest(API.GET_TASK_API, { taskVariables: [] })
    httpGETRequest(
      `${API.METRICS_SUBMISSIONS}/${id}?from=${fromDate}&to=${toDate}`,
      {}
    )
      .then((res) => {
        if (res.data) {
          dispatch(setMetrixSubmissionStatusCount(res.data.applicationStatus));
          dispatch(setMetrixStatusLoader(false));
          // done(null, res.data);
        } else {
          dispatch(setMetrixSubmissionStatusCount([]));
          // TODO error handling
          // dispatch(serviceActionError(res));
          dispatch(setMetrixStatusLoader(false));
        }
      })
      .catch((error) => {
        dispatch(setMetrixStatusLoadError(true));
        // TODO error handling
        console.log("Error", error);
        // dispatch(serviceActionError(error));
        dispatch(setMetrixStatusLoader(false));
        // done(error);
      });
  };
};
