import { tenantDetail } from "../../constants/tenantConstant";
import {
  setTenantData,
  setTenantDetails,
  setTenantID,
} from "../../actions/tenantActions";
import { Keycloak_Tenant_Client } from "../../constants/constants";
import { httpGETRequest } from "../httpRequestHandler";
import API from "../endpoints";
import UserService from "../../services/UserService";

export const getTenantKeycloakJson = (tenantKey) => {
  let tenantData = { ...tenantDetail };
  if (tenantKey) {
    tenantData.clientId = tenantKey + "-" + Keycloak_Tenant_Client;
  }
  return tenantData;
};

export const setTenantFromId = (tenantKey, ...rest) => {
  let tenantData = { ...tenantDetail };
  const done = rest.length ? rest[0] : () => {};
  tenantData.clientId = tenantKey + "-" + Keycloak_Tenant_Client;
  return (dispatch) => {
    dispatch(setTenantID(tenantKey));
    dispatch(setTenantDetails(tenantData));
    done(null, tenantDetail);
  };
};

// collects the tenant data from the admin API
export const getTenantData = (...rest) => {
  const done = rest.length ? rest[0] : () => {};
  let data = localStorage.getItem("tenantData");
  if (!data) {
    return (dispatch) => {
      httpGETRequest(API.GET_TENANT_DATA, {}, UserService.getToken(), true)
        .then((res) => {
          if (res.data) {
            dispatch(setTenantData(res.data));
            done(null, res.data);
          } else {
            dispatch(setTenantData({}));
          }
        })
        .catch((error) => {
          console.log(error);
          dispatch(setTenantData({}));
        });
    };
  } else {
    return (dispatch) => dispatch(setTenantData(JSON.parse(data)));
  }
};
