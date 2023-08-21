/* istanbul ignore file */
import { RequestService } from "@formsflow/service";
import API from "../endpoints";
//TODO move to a common action
import {
  getDashboards,
  getDashboardDetail,
  setInsightDetailLoader,
  setInsightError,
} from "../../actions/insightActions";

export const fetchDashboardDetails = (id, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    RequestService.httpGETRequest(`${API.GET_DASHBOARDS}/${id}`)
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
    RequestService.httpGETRequest(`${API.USER_DASHBOARDS}`)
      .then((res) => {
        if (res.data) {
          dispatch(getDashboards(res.data));
        } else {
          dispatch(setInsightError(res));
        }
      })
      .catch((error) => {
        dispatch(setInsightError(error.message));
      });
  };
};
