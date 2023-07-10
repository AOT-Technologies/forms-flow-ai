/* istanbul ignore file */
//import { httpGETRequest, httpPOSTRequest } from "../httpRequestHandler";
import { RequestService } from "@formsflow/service";
import API from "../endpoints/index";

export const fetchDesigners = (id) => {
  let url = API.DESIGNER_LIST;
  if(id){
    url += `/${id}`;
  }
  return RequestService.httpGETRequest(url);
};

export const addUsers = (data)=>{
  const url = API.DESIGNER_LIST;
  return RequestService.httpPOSTRequest(url,data);
};

export const getUserRoles = ()=>{
  const url = API.USER_ROLES;
  return RequestService.httpGETRequest(url);
};

export const getClientList = (id)=>{
  let url = API.CLIENT_LIST;
  if(id){
    url += `/${id}`;
  }
  return RequestService.httpGETRequest(url);
};

export const addClients = (data)=>{
  const url = API.CLIENT_LIST;
  return RequestService.httpPOSTRequest(url,data);
};