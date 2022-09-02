/* istanbul ignore file */
import { httpGETRequest, httpPOSTRequest } from "../httpRequestHandler";
import {
  setDashboards,
  dashboardErrorHandler,
  setGroups,
  updateErrorHandler,
  setDashboardAuthorizations,
} from "../../actions/dashboardActions";
import API from "../endpoints/index";

export const fetchdashboards = () => {
  return (dispatch) => {
    httpGETRequest(API.GET_DASHBOARDS)
      .then((res) => {
        if (res.data) {
          dispatch(setDashboards(res.data));
        } else {
          dispatch(dashboardErrorHandler("No dashboards found"));
        }
      })
      .catch((error) => {
        if (error?.response?.data) {
          dispatch(dashboardErrorHandler(error.response.data));
        } else {
          dispatch(dashboardErrorHandler("Failed to fetch dashboards"));
        }
      });
  };
};

export const fetchGroups = () => {
  return (dispatch) => {
    httpGETRequest(API.GET_GROUPS)
      .then((res) => {
        if (res.data) {
          dispatch(setGroups(res.data));
        } else {
          dispatch(dashboardErrorHandler("No groups found"));
        }
      })
      .catch((error) => {
        if (error?.response?.data) {
          dispatch(dashboardErrorHandler(error.response.data));
        } else {
          dispatch(dashboardErrorHandler("Failed to fetch groups"));
        }
      });
  };
};

export const updateAuthorization = (data) => {
  return (dispatch) => {
    httpPOSTRequest(API.DASHBOARD_AUTHORIZATION, data)
      .then((res) => {
        if (res.data) {
          dispatch(fetchAuthorizations());
        } else {
          dispatch(updateErrorHandler("Update Failed!"));
        }
      })
      .catch((error) => {
        dispatch(updateErrorHandler(error.message));
      });
  };
};

export const fetchAuthorizations = () => {
  return (dispatch) => {
    httpGETRequest(API.DASHBOARD_AUTHORIZATION)
      .then((res) => {
        if (res.data) {
          dispatch(setDashboardAuthorizations(res.data));
        } else {
          dispatch(dashboardErrorHandler("No dashboard authorizations found."));
        }
      })
      .catch((error) => {
        if (error?.response?.data) {
          dispatch(dashboardErrorHandler(error.response.data));
        } else {
          dispatch(dashboardErrorHandler("Network error."));
        }
      });
  };
};
