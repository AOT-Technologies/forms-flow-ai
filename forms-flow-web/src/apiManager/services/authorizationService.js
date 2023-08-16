/* istanbul ignore file */
//import { httpGETRequest, httpPOSTRequest } from "../httpRequestHandler";
import { RequestService } from "@formsflow/service";
import API from "../endpoints/index";
import { replaceUrl } from "../../helper/helper";


export const fetchFormAuthorizationDetials = (formId) => {
  const url = replaceUrl(
    API.HANDLE_AUTHORIZATION_FOR_DESIGNER,
    "<resource_id>",
    formId
  );
  return RequestService.httpGETRequest(url);
};


export const handleAuthorization = (data,formId) => {
  const url = replaceUrl(
    API.HANDLE_AUTHORIZATION_FOR_DESIGNER,
    "<resource_id>",
    formId
  );
  return RequestService.httpPOSTRequest(url, data);
};


export const getUserRoles = () => {
  const url = API.USER_ROLES;
  return RequestService.httpGETRequest(url);
};


export const getClientList = (id) => {
  let url = API.CLIENT_LIST;
  if (id) {
    url += `/${id}`;
  }
  return RequestService.httpGETRequest(url);
};


 


export const getReviewerList = (id) => {
  let url = API.APPLICATION_LIST;
  if (id) {
    url += `/${id}`;
  }
  return RequestService.httpGETRequest(url);
};


 