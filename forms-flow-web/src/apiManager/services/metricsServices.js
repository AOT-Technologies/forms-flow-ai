import { RequestService, StorageService } from "@formsflow/service";
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

    // Build GraphQL request params
    const url = API.GRAPHQL;
    const headers = {
      Authorization: `Bearer ${StorageService.get(StorageService.User.AUTH_TOKEN)}`,
      'Content-Type': 'application/json'
    };
    const query = `
      query Query {
        getForms(
          formName: "${formName}"
          fromDate: "${fromDate}"
          limit: ${limit}
          pageNo: ${pageNo}
          orderBy: "${searchBy}"
          toDate: "${toDate}"
        ) {
          items {
            id
            parentFormId
            totalSubmissions
            type
            version
            status
            title
          }
          totalCount
        }
      }
    `;
    RequestService.httpPOSTRequest(url, {
      query: query 
    }, null, true, headers)
      .then((res) => {
        if (res.data) {
          dispatch(setMetricsDateRangeLoading(false));
          dispatch(setMetricsLoader(false));
          dispatch(setMetricsStatusLoader(false));
          dispatch(setMetricsSubmissionCount(res.data.data.getForms.items));
          dispatch(setMetricsTotalItems(res.data.data.getForms.totalCount));
          if (res.data.data.getForms?.items[0]) {
              dispatch(setSelectedMetricsId(res.data.data.getForms.items[0].parentFormId));

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
  searchBy,
  options = {},
  ...rest
) => {
  const done = rest.length ? rest[0] : () => { };
  return (dispatch) => {
    if(options.parentId){
      dispatch(setSelectedMetricsId(id));
    }

    // Build GraphQL request params
    const url = API.GRAPHQL;
    const headers = {
      Authorization: `Bearer ${StorageService.get(StorageService.User.AUTH_TOKEN)}`,
      'Content-Type': 'application/json'
    };
    const query = `
      query Query {
        getMetricsSubmissionStatus(
          formId: "${id}"
          fromDate: "${fromDate}"
          orderBy: "${toDate}"
          toDate: "${searchBy}"
        ) {
          count
          metric
        }
      }
    `;

    RequestService.httpPOSTRequest(url, {
      query: query 
    }, null, true, headers)
      .then((res) => {
        if (res.data) {
          dispatch(setMetricsSubmissionStatusCount(res.data.data.getMetricsSubmissionStatus));
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


