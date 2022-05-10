import {tenantDetail} from "../../constants/tenantConstant";
import {
  setTenantDetails,
  setTenantID,
} from "../../actions/tenantActions";

export const getTenantKeycloakJson = (tenantKey) => {
  tenantDetail.clientId = tenantKey + "-" + tenantDetail.clientId
  return tenantDetail;
}

export const setTenantFromId = (tenantKey, ...rest)=>{
    const done = rest.length ? rest[0] :  ()=>{};
    // tenantDetail.clientId = tenantKey + "-" + tenantDetail.clientId
    return dispatch => {
      dispatch(setTenantID(tenantKey));
      dispatch(setTenantDetails(tenantDetail));
      done(null,tenantDetail);
 }
}