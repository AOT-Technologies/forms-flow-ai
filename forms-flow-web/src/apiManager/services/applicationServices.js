import { httpGETRequest } from "../httpRequestHandler";
import API from "../endpoints";
import {
  setApplicationListByFormId,
  serviceActionError,
  setApplicationList,
  setApplicationDetail
} from "../../actions/applicationActions";
import {replaceUrl} from "../../helper/helper";

export const getAllApplicationsByFormId = (formId,...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    //TODO remove the pageNo and limit currently its mandatory from api
    httpGETRequest(`${API.GET_ALL_APPLICATIONS_FROM_FORM_ID}/${formId}?pageNo=1&limit=1000`)
      .then((res) => {
        if (res.data) {
          const applications = res.data.applications || [];
          dispatch(setApplicationListByFormId(applications));
          done(null, applications);
        } else {
          console.log("Error", res);
          dispatch(serviceActionError(res));
        }
        done(null, res.data);
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(serviceActionError(error));
        done(error);
      });
  };
};

export const getAllApplications = (...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    //TODO remove the pageNo and limit currently its mandatory from api
    httpGETRequest(API.GET_ALL_APPLICATIONS)
      .then((res) => {
        if (res.data) {
          const applications = res.data.applications || [];
          dispatch(setApplicationList(applications));
          done(null, applications);
        } else {
          console.log("Error", res);
          dispatch(serviceActionError(res));
        }
        done(null, res.data);
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(serviceActionError(error));
        done(error);
      });
  };
};


export const getApplicationById = (applicationId, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const apiUrlgetApplication = replaceUrl(
    API.GET_APPLICATION,
    "<application_id>",
    applicationId
  );
  return (dispatch) => {
    //TODO remove the pageNo and limit currently its mandatory from api
    httpGETRequest(apiUrlgetApplication)
      .then((res) => {
        if (res.data) {
          const application = res.data.application;
          console.log("Application", application);
          dispatch(setApplicationDetail(application));
          done(null, application);
        } else {
          console.log("Error", res);
          dispatch(serviceActionError(res));
        }
        done(null, res.data);
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(serviceActionError(error));
        done(error);
      });
  };
};
