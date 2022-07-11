import { httpGETRequest } from "../httpRequestHandler";
import API from "../endpoints";
import UserService from "../../services/UserService";
import {
  setMetricsTotalItems,
  setMetricsSubmissionCount,
  setMetricsLoader,
  setMetricsStatusLoader,
  setMetricsSubmissionStatusCount,
  setSelectedMetricsId,
  setMetricsLoadError,
  setMetricsStatusLoadError,
} from "../../actions/metricsActions";

export const fetchMetricsList = (
  fromDate,
  toDate,
  setSearchBy,
  pageNo,
  limit,
  searchText,
  sortBy,
  sortOrder,
  ...rest
) => {
  setSearchBy = "modified";
  const done = rest.length ? rest[0] : () => { };

  return (dispatch) => {

    let url = `${API.METRICS_SUBMISSIONS}?from=${fromDate}&to=${toDate}&orderBy=${setSearchBy}&pageNo=${pageNo}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
    if (searchText) {
      url += `&formName=${searchText}`;
    }
    httpGETRequest(url, {}, UserService.getToken())
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
                setSearchBy
              )
            );
          } else {
            dispatch(setMetricsSubmissionStatusCount([]));
            dispatch(setMetricsStatusLoader(false));
          }
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
        dispatch(setMetricsLoader(false));
        dispatch(setMetricsLoadError(true));
      });
  };


};



export const fetchMetricsSubmissionCount = (
  fromDate,
  toDate,
  setSearchBy,
  formName,
  ...rest
) => {
  const done = rest.length ? rest[0] : () => { };
  return (dispatch) => {
    dispatch(setMetricsLoadError(false));
    /*eslint max-len: ["error", { "code": 170 }]*/
    let url = `${API.METRICS_SUBMISSIONS}?from=${fromDate}&to=${toDate}&orderBy=${setSearchBy}`;
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
                setSearchBy
              )
            );
          } else {
            dispatch(setMetricsSubmissionStatusCount([]));
            dispatch(setMetricsStatusLoader(false));
          }
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


