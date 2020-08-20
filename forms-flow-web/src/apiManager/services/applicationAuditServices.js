import { httpGETRequest, httpPOSTRequest } from "../httpRequestHandler";
import API from "../endpoints";
import {
  setApplicationHistoryList,
  serviceActionError,
  setLoader,
  setApplicationHistoryDetail,
} from "../../actions/taskActions";
import UserService from "../../services/UserService";
import { replaceUrl } from "../../helper/helper";


export const fetchApplicatinAuditHistoryList = (applicationId, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    const apiUrlAppHistory = replaceUrl(
      API.GET_APPLICATION_HISTORY_API,
      "<application_id>",
      applicationId
    );

    console.log("apiUrlAppHistory>>>", apiUrlAppHistory);

    // httpGETRequest(apiUrlAppHistory)
    // httpGETRequest("http://localhost:5000/application/1/history")
    httpGETRequest("http://localhost:5000/application/1/history", {}, UserService.getToken(),true)
      .then((res) => {
        if (res.data) {
        const applications = res.data.applications;
        let data = applications.map((app) => {
          return { ...app};
        });
        dispatch(setApplicationHistoryList(data));
        //dispatch(setLoader(false));
        done(null, res.data);
      } else {
        console.log("Error", res);
        dispatch(serviceActionError(res));
        dispatch(setLoader(false));
      }
      })
      .catch((error) => {
        dispatch(serviceActionError(error));
        dispatch(setLoader(false));
        done(error);
      });
  };
};;