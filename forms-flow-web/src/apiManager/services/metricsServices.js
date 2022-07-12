import { httpGETRequest } from "../httpRequestHandler";
import API from "../endpoints";
import {
  setMetricsSubmissionLimitChange,
  setMetricsTotalItems,
  setMetricsSubmissionCount,
  setMetricsLoader,
  setMetricsStatusLoader,
  setMetricsSubmissionStatusCount,
  setSelectedMetricsId,
  setMetricsLoadError,
  setMetricsStatusLoadError,
} from "../../actions/metricsActions";


export const fetchMetricsSubmissionCount = (
  fromDate,
  toDate,
  searchBy,
  formName,
  pageNo,
  limit,
  sortsBy,
  sortOrder,
  ...rest
) => {
  const done = rest.length ? rest[0] : () => { };
  return (dispatch) => {
    dispatch(setMetricsLoadError(false));
    /*eslint max-len: ["error", { "code": 170 }]*/
    let url = `${API.METRICS_SUBMISSIONS}?from=${fromDate}&to=${toDate}&orderBy=${searchBy}&pageNo=${pageNo}&limit=${limit}&sortBy=${sortsBy}&sortOrder=${sortOrder}`;
    if (formName) {
      url += `&formName=${formName}`;
    }
    httpGETRequest(url, {})
      .then((res) => {
        if (res.data) {
          dispatch(setMetricsSubmissionCount(res.data.applications));
          dispatch(setMetricsTotalItems(res.data.totalCount));
          dispatch(setMetricsLoader(false));
          if (res.data.applications && res.data.applications[0]) {
            dispatch(
              fetchMetricsSubmissionStatusCount(
                res.data.applications[0].mapperId,
                fromDate,
                toDate,
                searchBy
              )
            );
          } else {
            dispatch(setMetricsSubmissionStatusCount([]));
            dispatch(setMetricsStatusLoader(false));
          }
          dispatch(setMetricsSubmissionLimitChange(res.data.limit));
          done(null, res.data);
        } else {
          // TODO error handling

          dispatch(setMetricsStatusLoader(false));
          dispatch(setMetricsLoadError(true));
          // dispatch(setMetricsLoader(false));
          done(null, []);
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

export const fetchMetricsSubmissionStatusCount = (
  id,
  fromDate,
  toDate,
  setSearchBy,
  ...rest
) => {
  const done = rest.length ? rest[0] : () => { };
  return (dispatch) => {
    dispatch(setSelectedMetricsId(id));

    httpGETRequest(
      `${API.METRICS_SUBMISSIONS}/${id}?from=${fromDate}&to=${toDate}&orderBy=${setSearchBy}`
    )
      .then((res) => {
        if (res.data) {
          dispatch(setMetricsSubmissionStatusCount(res.data.applications));
          dispatch(setMetricsStatusLoader(false));
          // dispatch(setMetricsTotalItems(res.data.totalCount));
          done(null, res.data);
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
        done(error);
      });
  };
};


