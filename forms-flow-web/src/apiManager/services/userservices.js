import { httpGETRequest, httpPUTRequest } from "../httpRequestHandler";
import API from "../endpoints/index";
import UserService from "../../services/UserService";
import { toast } from "react-toastify";
import { Translation } from "react-i18next";
import { setAccessForForm, setRoleIds } from "../../actions/roleActions";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { setTenantData } from "../../actions/tenantActions";

export const updateUserlang = (data) => {
  const apiUpdatelang = API.LANG_UPDATE;

  // eslint-disable-next-line no-unused-vars
  return (dispatch) => {
    httpPUTRequest(apiUpdatelang, { locale: data }, UserService.getToken())
      .then((res) => {
        if (res.data) {
          //toast.success(<Translation>{(t)=>t(""Successfully Updated"")}</Translation>);
        } else {
          //toast.error(<Translation>{(t)=>t("Failed")}</Translation>);
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error(<Translation>{(t) => t("Failed")}</Translation>);
      });
  };
};

export const getFormioRoleIds = (...rest) => {
  // eslint-disable-next-line
  const done = rest.length ? rest[0] : () => {};
  let data;
  if (MULTITENANCY_ENABLED) {
    data = localStorage.getItem("tenantData");
  } else {
    data = localStorage.getItem("roleIds");
  }
  // if data is there no need to call api
  if (data) {
    return (dispatch) => {
      // converting data
      data = JSON.parse(data);
      if (MULTITENANCY_ENABLED) {
        dispatch(setTenantData(data));
        // if multi tenancy then roles taking form data.form and assign to data again
        data = data.form;
      }
      dispatch(setRoleIds(data));
      dispatch(setAccessForForm(data));
      done(null, data);
    };
  } else {
    let url = MULTITENANCY_ENABLED ? API.GET_TENANT_DATA : API.FORMIO_ROLES;
    return (dispatch) => {
      httpGETRequest(url, {}, UserService.getToken(), true)
        .then((res) => {
          if (res.data) {
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
  }
};
