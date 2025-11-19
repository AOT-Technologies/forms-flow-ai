/* istanbul ignore file */
import API from "../endpoints";
import UserService from "../../services/UserService";
import { StorageService, RequestService } from "@formsflow/service";
import { serviceActionError } from "../../actions/bpmTaskActions";
import {
  setBPMFormList,
  setBPMFormListLoading,
  setBpmFormLoading,
} from "../../actions/formActions";
import { replaceUrl } from "../../helper/helper";
import { setFormSearchLoading } from "../../actions/checkListActions";

// Track in-flight form list requests to prevent duplicate API calls (e.g., StrictMode double effects)
const inFlightFormListRequests = new Set();

export const fetchBPMFormList = ({
  pageNo,
  limit,
  formSort,
  formName,
  formType,
  showForOnlyCreateSubmissionUsers,
  includeSubmissionsCount,
}, done = () => {}) => {
  return (dispatch) => {
    let sortBy = formSort.activeKey;
    let sortOrder = formSort[sortBy]?.sortOrder;
    const requestKey = [
      pageNo,
      limit,
      sortBy,
      sortOrder,
      formName || "",
      formType || "",
      String(!!showForOnlyCreateSubmissionUsers),
      String(!!includeSubmissionsCount),
    ].join("|");

    // Deduplicate identical in-flight requests
    if (inFlightFormListRequests.has(requestKey)) {
      return;
    }
    inFlightFormListRequests.add(requestKey);

    let url = `${API.FORM}?pageNo=${pageNo}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

    const queryParams = [];

    if (formType) queryParams.push(`formType=${formType}`);
    if (formName) queryParams.push(`search=${encodeURIComponent(formName)}`);
    if (typeof showForOnlyCreateSubmissionUsers === "boolean") {
      queryParams.push(`showForOnlyCreateSubmissionUsers=${showForOnlyCreateSubmissionUsers}`);
    }
    if (typeof includeSubmissionsCount === "boolean") {
      queryParams.push(`includeSubmissionsCount=${includeSubmissionsCount}`);
    }
    
    const queryString = queryParams.length ? `&${queryParams.join("&")}` : "";
    url += queryString;
    
    RequestService.httpGETRequest(url, {}, StorageService.get(StorageService.User.AUTH_TOKEN))
      .then((res) => {
        inFlightFormListRequests.delete(requestKey);
        if (res.data) { 
          dispatch(setBPMFormList(res.data));
          dispatch(setBPMFormListLoading(false));
          dispatch(setBpmFormLoading(false));
          dispatch(setFormSearchLoading(false));

          done(null, res.data);
        } else {
          dispatch(setBPMFormListLoading(false));
          dispatch(serviceActionError(res));
          dispatch(setFormSearchLoading(false));
        }
      })
      .catch((error) => {
        inFlightFormListRequests.delete(requestKey);
        dispatch(setBPMFormListLoading(false));
        dispatch(serviceActionError(error));
        done(error);
      });
  };
};

export const fetchAllForms = ()=>{
  //activeForms means published forms only : status = Active
  return RequestService.httpGETRequest(`${API.FORM}?activeForms=true`);
};

export const fetchFormByAlias = (path, ...rest) => {
  const done = rest.length ? rest[0] : () => { };

  const apiUrlGetFormByAlias = replaceUrl(
    API.GET_FORM_BY_ALIAS,
    "<form_path>",
    path
  );

  return (dispatch) => {
    let token = UserService.getFormioToken() ? { "x-jwt-token": UserService.getFormioToken() } : {};
    RequestService.httpGETRequest(apiUrlGetFormByAlias, {}, "", false, {
      ...token
    })
      .then((res) => {
        if (res.data) {
          done(null, res.data);
        } else {
          dispatch(serviceActionError(res));
          //dispatch(setBPMTaskLoader(false));
        }
      })
      .catch((error) => {
        //console.log("Error", error);
        dispatch(serviceActionError(error));
        //dispatch(setBPMTaskLoader(false));
        done(error);
      });
  };
};




export const fetchFormById = (id) => {
  let token = UserService.getFormioToken() ? { "x-jwt-token": UserService.getFormioToken() } : {};
  return RequestService.httpGETRequest(`${API.GET_FORM_BY_ID}/${id}`, {}, "", false, {
    ...token
  });

};

