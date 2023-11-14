import API from "../endpoints/index";
import { StorageService, RequestService } from "@formsflow/service";
import { setAccessForForm, setRoleIds } from "../../actions/roleActions";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { setTenantData } from "../../actions/tenantActions";

export const getFormioRoleIds = (...rest) => {
  // eslint-disable-next-line
  const done = rest.length ? rest[0] : () => {};
  const url = MULTITENANCY_ENABLED ? API.GET_TENANT_DATA : API.FORMIO_ROLES;
  return (dispatch) => {
    RequestService.httpGETRequest(
      url,
      {},
      StorageService.get(StorageService.User.AUTH_TOKEN),
      true
    )
      .then((res) => {
        const token = res.headers["x-jwt-token"];
        if (res.data && res.data.form && token) {
          localStorage.setItem("formioToken", token);
          localStorage.setItem("roleIds", JSON.stringify(res.data.form));
          dispatch(setRoleIds(res.data?.form));
          dispatch(setAccessForForm(res.data?.form));
          if (MULTITENANCY_ENABLED) {
            dispatch(setTenantData(res.data));
          }
          done(null, res.data.form);
        } else {
          if (MULTITENANCY_ENABLED) {
            dispatch(setTenantData({}));
          }
          done(res, null);
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
