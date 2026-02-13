import API from "../endpoints/index";
import { RequestService, fetchAndStoreFormioRoles, StorageService } from "@formsflow/service";
import { setAccessForForm, setRoleIds } from "../../actions/roleActions";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { setTenantData } from "../../actions/tenantActions";

export const getFormioRoleIds = (...rest) => {
  // eslint-disable-next-line
  const done = rest.length ? rest[0] : () => {};

  return (dispatch) => {
      fetchAndStoreFormioRoles()
      .then((result) => {
        if (result.success && result.data?.form) {
          const form = result.data.form;
          dispatch(setRoleIds(form));
          dispatch(setAccessForForm(form));
          if (MULTITENANCY_ENABLED) {
            dispatch(setTenantData(result.data));
          }
          done(null, form);
        } else {
          if (MULTITENANCY_ENABLED) {
            dispatch(setTenantData({}));
          }
          done(result.error, null);
        }
      })
      .catch((error) => {
        if (MULTITENANCY_ENABLED) {
          dispatch(setTenantData({}));
        }
        done(error, null);
      });
  };
};

export const fetchUsers = (
  group,
  pageNo = 1,
  search,
  errorHandler,
  role = true,
  count = true
) => {
  let url = `${API.GET_API_USER_LIST}?role=${role}&count=${count}`;
  if (group) url += `&memberOfGroup=${group}`;
  if (pageNo) url += `&pageNo=${pageNo}&limit=5`;
  if (search) url += `&search=${search}`;

  return RequestService.httpGETRequest(url);
};


export const updateDefaultFilter = (defaultFilter) => {
  return RequestService.httpPOSTRequest(
    API.UPDATE_DEFAULT_FILTER,
    {defaultFilter}
  );
}; 

export const addUserOrgRole = (data)=>{
  return RequestService.httpPUTRequest(
    API.USER_INFO_UPDATE,
    data,
    StorageService.get(StorageService.User.AUTH_TOKEN)
  );
}; 

export const addUserOrgDetails = (tenantId,orgDetails)=>{
  return RequestService.httpPUTRequest(
    API.USER_ORG_DETAILS.replace("<tenant_id>", tenantId),
    orgDetails,
    StorageService.get(StorageService.User.AUTH_TOKEN)
  );
};