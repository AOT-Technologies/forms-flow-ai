import { httpGETRequest } from "../httpRequestHandler";
import API from "../endpoints";
import {
  setApplicationListByFormId,
  serviceActionError,
  setApplicationList,
  setApplicationDetail,
  setLoader,setApplicationDetailLoader,
  setApplicationProcess, setApplicationListCount
} from "../../actions/applicationActions";
import { applicationSubmissionFormatter } from "./formatterService";
import {replaceUrl} from "../../helper/helper";

export const getAllApplicationsByFormId = (formId,...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    //TODO remove the pageNo and limit currently its mandatory from api
    httpGETRequest(`${API.GET_ALL_APPLICATIONS_FROM_FORM_ID}/${formId}`)
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

export const getApplicationDetail = (id, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    httpGETRequest(
      `${API.GET_ALL_APPLICATIONS + id}`
    )
      .then((res) => {
        if (res.data) {
          const application = res.data.application;
          const applicationVariables = applicationSubmissionFormatter(application.variables);
          delete application.variables;
          let applicationDetail = { ...application, ...applicationVariables };
          dispatch(setApplicationDetail(applicationDetail));
          dispatch(setLoader(false));
          done(null, applicationDetail);
        }
      })
      .catch((error) => {
        dispatch(serviceActionError(error));
        dispatch(setLoader(false));
        done(error);
      });
  };
};


export const getAllApplications = (pageNo=1, limit=10,...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    //TODO remove the pageNo and limit currently its mandatory from api
    //`${API.GET_ALL_APPLICATIONS}?pageNo=${pageNo}&limit=${limit}`
    httpGETRequest(API.GET_ALL_APPLICATIONS)
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
          const application = res.data;
          console.log("Application in api manager", application);
          dispatch(setApplicationDetail(application));
          done(null, application);
        } else {
          console.log("Error", res);
          dispatch(serviceActionError(res));
        }
        done(null, res.data);
        dispatch(setApplicationDetailLoader(false));
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(serviceActionError(error));
        done(error);
        dispatch(setApplicationDetailLoader(false))
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



