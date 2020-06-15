import { httpGETRequest } from "../httpRequestHandler";
import API from "../endpoints";
import {
  setMetrixSubmissionCount,
  setMetrixLoader,
  setMetrixStatusLoader,
  setMetrixSubmissionStatusCount,
  setSelectedMetrixId,
} from "../../actions/metrixActions";

export const fetchMetrixSubmissionCount = (fromDate, toDate, ...rest) => {
  return (dispatch) => {
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
          }
        } else {
          // TODO error handling
          console.log("Error", res);
          // dispatch(serviceActionError(res));
          // dispatch(setMetrixLoader(false));
        }
      })
      .catch((error) => {
        // TODO error handling
        console.log("Error", error);
        // dispatch(serviceActionError(error));
        dispatch(setMetrixLoader(false));
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
        // TODO error handling
        console.log("Error", error);
        // dispatch(serviceActionError(error));
        dispatch(setMetrixStatusLoader(false));
        // done(error);
      });
  };
};
