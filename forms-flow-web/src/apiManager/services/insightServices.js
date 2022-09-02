/* istanbul ignore file */
import { httpGETRequest } from "../httpRequestHandler";
import API from "../endpoints";
//TODO move to a common action
import {
  getDashboards,
  getDashboardDetail,
  setInsightDetailLoader,
  setInsightDashboardListLoader,
  setInsightError,
} from "../../actions/insightActions";

export const fetchDashboardDetails = (id, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    httpGETRequest(`${API.GET_DASHBOARDS}/${id}`)
      .then((res) => {
        if (res.data) {
          dispatch(getDashboardDetail(res.data));
          dispatch(setInsightDetailLoader(false));
          done(null, res);
        } else {
          dispatch(setInsightDetailLoader(false));
          dispatch(setInsightError(res));
          done("Error Getting data");
        }
      })
      .catch((error) => {
        console.log(error);
        dispatch(setInsightDetailLoader(false));
        dispatch(setInsightError(error));
        done(error);
      });
  };
};

export const fetchUserDashboards = () => {
  return (dispatch) => {
    httpGETRequest(`${API.USER_DASHBOARDS}`)
      .then((res) => {
        if (res.data) {
          dispatch(getDashboards(res.data));
          dispatch(setInsightDashboardListLoader(false));
        } else {
          dispatch(setInsightError(res));
          dispatch(setInsightDashboardListLoader(false));
        }
      })
      .catch((error) => {
        dispatch(setInsightError(error.message));
        dispatch(setInsightDashboardListLoader(false));
      });
  };
};
