import { httpGETRequest } from "../httpRequestHandler";
import API from "../endpoints";
import {
  setApplicationHistoryList,
  serviceActionError,
  setUpdateHistoryLoader
} from "../../actions/taskApplicationHistoryActions";
import UserService from "../../services/UserService";
import { replaceUrl } from "../../helper/helper";


export const fetchApplicationAuditHistoryList = (applicationId, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    const apiUrlAppHistory = replaceUrl(
      API.GET_APPLICATION_HISTORY_API,
      "<application_id>",
      applicationId
    );

     httpGETRequest(apiUrlAppHistory, {}, UserService.getToken(),true)
      .then((res) => {
        if (res.data) {
        const applications = res.data.applications;
        let data = applications.map((app) => {
          return { ...app};
        });
        dispatch(setApplicationHistoryList(data));
        dispatch(setUpdateHistoryLoader(false))
        done(null, res.data);
      } else {
        dispatch(serviceActionError(res));
        dispatch(setUpdateHistoryLoader(false));
      }
      })
      .catch((error) => {
        dispatch(serviceActionError(error));
        dispatch(setUpdateHistoryLoader(false))
        done(error);
      });
  };
};
