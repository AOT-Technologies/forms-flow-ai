import { tenantDetail } from "../../constants/tenantConstant";
import { setTenantDetails, setTenantID } from "../../actions/tenantActions";
import { Keycloak_Tenant_Client } from "../../constants/constants";

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
