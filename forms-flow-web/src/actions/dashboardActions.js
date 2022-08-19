/* istanbul ignore file */
import { toast } from "react-toastify";
import ACTION_CONSTANTS from "./actionConstants";

//updates the dashboards state
export const setDashboards = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.DASHBOARDS_LIST,
    payload: data,
  });
};
// handles the error cases
export const dashboardErrorHandler = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.DASHBOARDS_LIST_ERROR,
    payload: data,
  });
};

// updates the groups state
export const setGroups = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.DASHBOARDS_LIST_GROUPS,
    payload: data,
  });
};

export const updateErrorHandler = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.DASHBOARDS_UPDATE_ERROR,
    payload: data,
  });
  toast.error(data);
};


export const setDashboardAuthorizations = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.SET_AUTHORIZATIONS,
    payload: data,
  });
};

export const updateDashboardAuthorizationList = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.UPDATE_AUTHORIZATIONS,
    payload: data,
  });
};
