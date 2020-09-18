import { httpGETRequest } from "../httpRequestHandler";
import API from "../endpoints";
import {
  setApplicationListByFormId,
  serviceActionError,
  setApplicationList,
  setApplicationDetail,
  setApplicationProcess, setApplicationListCount
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

export const getAllApplications = (pageNo=1, limit=10,...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    //TODO remove the pageNo and limit currently its mandatory from api
    httpGETRequest(`${API.GET_ALL_APPLICATIONS}?pageNo=${pageNo}&limit=${limit}`)
      .then((res) => {
        if (res.data) {
          const applications = res.data.applications || [];
          dispatch(setApplicationListCount(res.data.totalCount || 0))
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

export const getApplicationFormDataByAppId = (application_id,...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    const apiUrlAppFormProcess = replaceUrl(
      API.GET_PROCESS_MAPPER_FOR_APPLICATION,
      "<application_id>",
      application_id
    );
    httpGETRequest(apiUrlAppFormProcess)
      .then((res) => {
        if (res.data) {
          const process = res.data || [];
          dispatch(setApplicationProcess(process));
          done(null, process);
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



