import { httpGETRequest } from "../httpRequestHandler";
import API from "../endpoints";
import {
  setMetricsSubmissionCount,
  setMetricsLoader,
  setMetricsStatusLoader,
  setMetricsSubmissionStatusCount,
  setSelectedMetricsId,
  setMetricsLoadError,
  setMetricsStatusLoadError,
} from "../../actions/metricsActions";

export const fetchMetricsSubmissionCount = (fromDate, toDate, ...rest) => {
  return (dispatch) => {
    dispatch(setMetricsLoadError(false));
    httpGETRequest(
      `${API.METRICS_SUBMISSIONS}?from=${fromDate}&to=${toDate}`,
      {}
    )
      .then((res) => {
        if (res.data) {
          dispatch(setMetricsSubmissionCount(res.data.applications));
          dispatch(setMetricsLoader(false));
          if (res.data.applications && res.data.applications[0]) {
            dispatch(
              fetchMetricsSubmissionStatusCount(
                res.data.applications[0].mapperId,
                fromDate,
                toDate
              )
            );
          } else {
            dispatch(setMetricsSubmissionStatusCount([]));
            dispatch(setMetricsStatusLoader(false));
          }
        } else {
          // TODO error handling
          console.log("Error", res);
          dispatch(setMetricsStatusLoader(false));
          dispatch(setMetricsLoadError(true));
          // dispatch(setMetricsLoader(false));
        }
      })
      .catch((error) => {
        // TODO error handling
        console.log("Error", error);
        // dispatch(serviceActionError(error));
        dispatch(setMetricsLoader(false));
        dispatch(setMetricsLoadError(true));
      });
  };
};

export const fetchMetricsSubmissionStatusCount = (id, fromDate, toDate) => {
  // const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    dispatch(setSelectedMetricsId(id));
    // httpPOSTRequest(API.GET_TASK_API, { taskVariables: [] })
    httpGETRequest(
      `${API.METRICS_SUBMISSIONS}/${id}?from=${fromDate}&to=${toDate}`,
      {}
    )
      .then((res) => {
        if (res.data) {
          dispatch(setMetricsSubmissionStatusCount(res.data.applicationStatus));
          dispatch(setMetricsStatusLoader(false));
          // done(null, res.data);
        } else {
          dispatch(setMetricsSubmissionStatusCount([]));
          // TODO error handling
          // dispatch(serviceActionError(res));
          dispatch(setMetricsStatusLoader(false));
        }
      })
      .catch((error) => {
        dispatch(setMetricsStatusLoadError(true));
        // TODO error handling
        console.log("Error", error);
        // dispatch(serviceActionError(error));
        dispatch(setMetricsStatusLoader(false));
        // done(error);
      });
  };
};
