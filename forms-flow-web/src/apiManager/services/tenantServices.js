import { tenantDetail } from "../../constants/tenantConstant";
import { RequestService } from "@formsflow/service";
import {
  setTenantDetails,
  setTenantID,
} from "../../actions/tenantActions";
import { Keycloak_Tenant_Client } from "../../constants/constants";
import { replaceUrl } from "../../helper/helper";
import API from "../endpoints";



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

export const validateTenant = (tenantId) => {
  const validateTenantUrl = replaceUrl(
    API.VALIDATE_TENANT,
    "<tenant_id>",
    tenantId
  );
  return RequestService.httpGETRequest(validateTenantUrl);
};