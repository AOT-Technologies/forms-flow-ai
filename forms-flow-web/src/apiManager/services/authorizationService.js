/* istanbul ignore file */
import { httpGETRequest, httpPOSTRequest } from "../httpRequestHandler";
import API from "../endpoints/index";

export const fetchUsers = () => {
  return httpGETRequest(API.USER_LIST);
};

export const addUsers = (data)=>{
  const url = API.USER_LIST;
  return httpPOSTRequest(url,data);
};

export const getUserRoles = ()=>{
  const url = API.USER_ROLES;
  return httpGETRequest(url);
};

export const getClientList = ()=>{
  const url = API.CLIENT_LIST;
  return httpGETRequest(url);
};

export const addClients = (data)=>{
  const url = API.CLIENT_LIST;
  return httpPOSTRequest(url,data);
};