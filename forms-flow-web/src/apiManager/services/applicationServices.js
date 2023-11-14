/* istanbul ignore file */

import { RequestService } from "@formsflow/service";

import API from "../endpoints";
import {
  setApplicationListByFormId,
  serviceActionError,
  setApplicationList,
  setApplicationDetail,
  setApplicationDetailLoader,
  setApplicationProcess,
  setApplicationListCount,
  setApplicationDetailStatusCode,
  setApplicationStatusList,
  setApplicationError,
} from "../../actions/applicationActions";
import { replaceUrl } from "../../helper/helper";
import moment from "moment";
import { getFormattedProcess } from "./formatterService";
import { setPublicFormStatus } from "../../actions/formActions";
import { setDraftCount } from "../../actions/draftActions";

export const getAllApplicationsByFormId = (formId, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    //TODO remove the pageNo and limit currently its mandatory from api
    RequestService.httpGETRequest(
      `${API.GET_ALL_APPLICATIONS_FROM_FORM_ID}/${formId}`
    )
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

// export const getAllApplications = (pageNo = 1, limit = 5, ...rest) => {
//   const done = rest.length ? rest[0] : () => {};
//   return (dispatch) => {
//     //TODO remove the pageNo and limit currently its mandatory from api
//     //`${API.GET_ALL_APPLICATIONS}?pageNo=${pageNo}&limit=${limit}`
//     RequestService.httpGETRequest(
//       `${API.GET_ALL_APPLICATIONS}?pageNo=${pageNo}&limit=${limit}`
//     )
//       .then((res) => {
//         if (res.data) {
//           const applications = res.data.applications || [];
//           dispatch(setApplicationListCount(res.data.totalCount || 0));
//           dispatch(setDraftCount(res.data?.draftCount || 0));
//           dispatch(setApplicationList(applications));
//           done(null, applications);
//         } else {
//           dispatch(setApplicationError("Submissions not found"));
//         }
//         done(null, res.data);
//       })
//       .catch((error) => {
//         dispatch(setApplicationError("Failed to fetch submissions"));
//         done(error);
//       });
//   };
// };

export const getApplicationById = (applicationId, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const apiUrlgetApplication = replaceUrl(
    API.GET_APPLICATION,
    "<application_id>",
    applicationId
  );
  return (dispatch) => {
    //TODO remove the pageNo and limit currently its mandatory from api
    RequestService.httpGETRequest(apiUrlgetApplication)
      .then((res) => {
        if (res.data && Object.keys(res.data).length) {
          const application = res.data;
          const processData = getFormattedProcess(application);
          dispatch(setApplicationDetail(application));
          dispatch(setApplicationProcess(processData));
          dispatch(setApplicationDetailStatusCode(res.status));
          done(null, application);
        } else {
          dispatch(serviceActionError(res));
          dispatch(setApplicationDetail({}));
          dispatch(setApplicationDetailStatusCode(403));
          done("No data");
          dispatch(setApplicationDetailLoader(false));
        }
        done(null, res.data);
        dispatch(setApplicationDetailLoader(false));
      })
      .catch((error) => {
        console.log("Error", error);
        dispatch(serviceActionError(error));
        dispatch(setApplicationDetail({}));
        dispatch(setApplicationDetailStatusCode(403));
        done(error);
        dispatch(setApplicationDetailLoader(false));
      });
  };
};

export const applicationCreate = (data, ...rest) => {
  const done = rest.length ? rest[1] : () => {};
  const URL = API.APPLICATION_START;
  return (dispatch) => {
    RequestService.httpPOSTRequest(URL, data)
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

export const publicApplicationCreate = (data, ...rest) => {
  const done = rest.length ? rest[1] : () => {};
  const URL = API.PUBLIC_APPLICATION_START;
  return (dispatch) => {
    RequestService.httpPOSTRequestWithoutToken(URL, data)
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

export const publicApplicationStatus = (formId, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const URL = `${API.PUBLIC_APPLICATION_STATUS}/${formId}`;
  return (dispatch) => {
    RequestService.httpGETRequest(URL)
      .then((res) => {
        if (res.data) {
          dispatch(
            setPublicFormStatus({
              anonymous: res.data.is_anonymous,
              status: res.data.status,
            })
          );
          done(null, res.data);
        } else {
          dispatch(setPublicFormStatus(null));
          dispatch(serviceActionError(res));
          done("Error Fetching Data");
        }
      })
      .catch((error) => {
        dispatch(setPublicFormStatus(null));
        dispatch(serviceActionError(error));
        done(error);
      });
  };
};

export const updateApplicationEvent = (applicationId, data, ...rest) => {
  /* * Data Format
 {
  "messageName" : "application_resubmitted",
  "processInstanceId":"a8dad78e-fa3b-11ea-a119-0242ac1f0003"
}
* */

  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    const apiUrlAppResubmit = replaceUrl(
      API.APPLICATION_EVENT_UPDATE,
      "<application_id>",
      applicationId
    );

    RequestService.httpPOSTRequest(apiUrlAppResubmit, data)
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

// filter endpoint

export const getAllApplications = (params, ...rest) => {

  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    const { applicationName, id, applicationStatus, modified } = params;
    let url = `${API.GET_ALL_APPLICATIONS}?pageNo=${params.page}&limit=${params.limit}`;
    if (applicationName && applicationName !== "") {
      url += `&applicationName=${applicationName}`;
    }
    if (id && id !== "") {
      url += `&Id=${id}`;
    }

    if (applicationStatus && applicationStatus !== "") {
      url += `&applicationStatus=${applicationStatus}`;
    }

    if (modified && modified?.length === 2) {
      let modifiedFrom = moment
        .utc(modified[0])
        .format("YYYY-MM-DDTHH:mm:ssZ")
        .replace(/\+/g, "%2B");
      let modifiedTo = moment
        .utc(modified[1])
        .format("YYYY-MM-DDTHH:mm:ssZ")
        .replace(/\+/g, "%2B");
      url += `&modifiedFrom=${modifiedFrom}&modifiedTo=${modifiedTo}`;
    }

    if (params.sortField || params.sortOrder) {
      url += `&sortBy=${params.sortField ? params.sortField : null}&sortOrder=${
        params.sortOrder ? params.sortOrder : null
      }`;
    }

    RequestService.httpGETRequest(url)
      .then((res) => {
        if (res.data) {
          const applications = res.data.applications || [];
          dispatch(setApplicationListCount(res.data.totalCount || 0));
          dispatch(setDraftCount(res.data?.draftCount || 0));
          dispatch(setApplicationList(applications));
          done(null, applications);
        } else {
          dispatch(serviceActionError(res));
        }
        done(null, res.data);
      })
      .catch((error) => {
        dispatch(serviceActionError(error));
        done(error);
      });
  };
};

export const getAllApplicationStatus = (params, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    //TODO remove the pageNo and limit currently its mandatory from api
    //`${API.GET_ALL_APPLICATIONS}?pageNo=${pageNo}&limit=${limit}`
    RequestService.httpGETRequest(`${API.GET_ALL_APPLICATIONS_STATUS}`)
      .then((res) => {
        if (res.data) {
          dispatch(setApplicationStatusList(res.data.applicationStatus));
          //done(null, applications);
        } else {
          dispatch(setApplicationError("Submission status not found"));
        }
        done(null, res.data);
      })
      .catch((error) => {
        dispatch(setApplicationError("Failed to fetch submission status"));
        done(error);
      });
  };
};
