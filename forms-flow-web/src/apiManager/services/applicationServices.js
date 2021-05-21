import {httpGETRequest, httpPOSTRequest} from "../httpRequestHandler";
import API from "../endpoints";
import {
  setApplicationListByFormId,
  serviceActionError,
  setApplicationList,
  setApplicationDetail,
  setApplicationDetailLoader,
  setApplicationProcess, setApplicationListCount
} from "../../actions/applicationActions";
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

export const applicationCreate = (data, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const URL = API.APPLICATION_START;
  return (dispatch) => {
    httpPOSTRequest(URL, data)
      .then((res) => {
        if (res.data) {
          done(null, res.data);
        } else {
          dispatch(serviceActionError(res));
          done("Error Posting data");
        }
      })
      .catch((error) => {
        dispatch(serviceActionError(error));
        done(error);
      });
  };
};



export const updateApplicationEvent = (data,...rest) => {
  /* * Data Format
 {
  "messageName" : "application_resubmitted",
  "processInstanceId":"a8dad78e-fa3b-11ea-a119-0242ac1f0003"
}
* */
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    httpPOSTRequest(API.APPLICATION_EVENT_UPDATE, data)
      .then((res) => {
        if (res.data) {
          done(null, res.data);
        } else {
          dispatch(serviceActionError(res));
          done("Error Posting data");
        }
      })
      .catch((error) => {
        dispatch(serviceActionError(error));
        done(error);
      });
  };
};





