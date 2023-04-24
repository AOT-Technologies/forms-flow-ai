/* istanbul ignore file */
import { httpGETRequest, httpPOSTRequest } from "../httpRequestHandler";
import API from "../endpoints/index";

export const fetchUsers = (id) => {
  let url = API.USER_LIST;
  if(id){
    url += `/${id}`;
  }
  return httpGETRequest(url);
};

export const addUsers = (data)=>{
  const url = API.USER_LIST;
  return httpPOSTRequest(url,data);
};

export const getUserRoles = ()=>{
  const url = API.USER_ROLES;
  return httpGETRequest(url);
};

export const getClientList = (id)=>{
  let url = API.CLIENT_LIST;
  if(id){
    url += `/${id}`;
  }
  return httpGETRequest(url);
};

export const addClients = (data)=>{
  const url = API.CLIENT_LIST;
  return httpPOSTRequest(url,data);
};