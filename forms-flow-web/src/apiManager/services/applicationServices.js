 /* istanbul ignore file */
import {httpGETRequest, httpPOSTRequest,httpPOSTRequestWithoutToken} from "../httpRequestHandler";
import API from "../endpoints";
import {
  setApplicationListByFormId,
  serviceActionError,
  setApplicationList,
  setApplicationDetail,
  setApplicationDetailLoader,
  setApplicationProcess, setApplicationListCount, setApplicationDetailStatusCode, setApplicationStatusList,setApplicationError
} from "../../actions/applicationActions";
import {replaceUrl} from "../../helper/helper";
import moment from 'moment';
import {getFormattedProcess} from "./formatterService";
import {setPublicFormStatus} from '../../actions/formActions';

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

export const getAllApplications = (pageNo=1, limit=5,...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    //TODO remove the pageNo and limit currently its mandatory from api
    //`${API.GET_ALL_APPLICATIONS}?pageNo=${pageNo}&limit=${limit}`
    httpGETRequest(`${API.GET_ALL_APPLICATIONS}?pageNo=${pageNo}&limit=${limit}`)
      .then((res) => {
        if (res.data) {
          const applications = res.data.applications || [];
          dispatch(setApplicationListCount(res.data.totalCount || 0))
          dispatch(setApplicationList(applications));
          done(null, applications);
        } else {
          dispatch(setApplicationError("Applications not found"));
        }
        done(null, res.data);
      })
      .catch((error) => {
        dispatch(setApplicationError("Failed to fetch applications"));
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
          done('No data');
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


export const publicApplicationCreate = (data, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  const URL = API.PUBLIC_APPLICATION_START;
  return (dispatch) => {
    httpPOSTRequestWithoutToken(URL, data)
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
    httpGETRequest(URL)
      .then((res) => {
        if (res.data) {
            dispatch(setPublicFormStatus({anonymous:res.data.is_anonymous,status:res.data.status}));
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

// filter endpoint

export const FilterApplications = (params,...rest) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch)=>{
    const {applicationName,id,modified,applicationStatus} = params.filters;
    let url =`${API.GET_ALL_APPLICATIONS}?pageNo=${params.page}&limit=${params.sizePerPage}`;
    if(applicationName && applicationName !==""){
      url+=`&applicationName=${applicationName?.filterVal}`
    }
    if(id && id !==""){
      url+=`&Id=${id.filterVal}`
    }

    if(applicationStatus && applicationStatus !==""){
      url+=`&applicationStatus=${applicationStatus?.filterVal}`
    }

    if(modified && modified?.filterVal?.length === 2){
      let modifiedFrom = moment.utc(modified.filterVal[0]).format("YYYY-MM-DDTHH:mm:ssZ").replace("+","%2B");
      let modifiedTo = moment.utc(modified.filterVal[1]).format("YYYY-MM-DDTHH:mm:ssZ").replace("+","%2B");
      url+=`&modifiedFrom=${modifiedFrom}&modifiedTo=${modifiedTo}`
  }

    if(params.sortField !== null){
      url+=`&sortBy=${params.sortField}&sortOrder=${params.sortOrder}`
    }

    httpGETRequest(url)
      .then((res) => {
        if (res.data) {
          const applications = res.data.applications || [];
          dispatch(setApplicationListCount(res.data.totalCount || 0))
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
  }
};

export const getAllApplicationStatus = (params,...rest) => {
  //console.log("hai",params)
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    //TODO remove the pageNo and limit currently its mandatory from api
    //`${API.GET_ALL_APPLICATIONS}?pageNo=${pageNo}&limit=${limit}`
    httpGETRequest(`${API.GET_ALL_APPLICATIONS_STATUS}`)
      .then((res) => {
        if (res.data) {
          dispatch(setApplicationStatusList(res.data.applicationStatus))
          //done(null, applications);
        } else {
          dispatch(setApplicationError("Application status not found"));
        }
        done(null, res.data);
      })
      .catch((error) => {
        dispatch(setApplicationError("Failed to fetch application status"));
        done(error);
      });
  };
};


