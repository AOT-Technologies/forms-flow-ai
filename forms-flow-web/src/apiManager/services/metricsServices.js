import { RequestService } from "@formsflow/service";
import API from "../endpoints";
import {
  setMetricsDateRangeLoading,
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
    const url = API.GRAPHQL;
    /*eslint max-len: ["error", { "code": 170 }]*/
    const query = `
      query FetchMetricsSubmissionQuery {
        getSubmission(sortBy: "${sortsBy}", sortOrder: "${sortOrder}", pageNo: ${pageNo}, limit: ${limit}, filters: {
          from: "${fromDate}",
          to: "${toDate}",
          orderBy: "${searchBy}",
        }) {
          submissions {
            applicationStatus
            created
            createdBy
            data
            formName
            id
            submissionId
          }
          totalCount
        }
      }
    `;
    
    RequestService.httpPOSTRequest(url, {
      query: query 
    })
      .then((res) => {
        if (res.data) {
          dispatch(setMetricsDateRangeLoading(false));
          dispatch(setMetricsLoader(false));
          dispatch(setMetricsStatusLoader(false));
          dispatch(setMetricsSubmissionCount(res.data.data.getSubmission.submissions));
          dispatch(setMetricsTotalItems(res.data.data.getSubmission.totalCount));
          if (res.data.applications && res.data.applications[0]) {
              dispatch(setSelectedMetricsId(res.data.applications[0].parentFormId));

          } else {
            dispatch(setSelectedMetricsId(null));
          }
          done(null, res.data);
        } else {
          dispatch(setMetricsDateRangeLoading(false));
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
        dispatch(setMetricsDateRangeLoading(false));
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
  options = {},
  ...rest
) => {
  const done = rest.length ? rest[0] : () => { };
  return (dispatch) => {
    if(options.parentId){
      dispatch(setSelectedMetricsId(id));
    }

    RequestService.httpGETRequest(
      `${API.METRICS_SUBMISSIONS}/${id}?from=${fromDate}&to=${toDate}&orderBy=${setSearchBy}&formType=${options.parentId ? "parent" : "form"}`
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


