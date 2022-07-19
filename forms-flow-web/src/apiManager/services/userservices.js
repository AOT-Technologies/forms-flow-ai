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

export const getFormioRoleIds = (...rest)=>{
  // eslint-disable-next-line
  const done = rest.length ? rest[0] : () => {};
  let data; 
  if(MULTITENANCY_ENABLED){
    data = localStorage.getItem("tenantData");
  }else {
    data = localStorage.getItem("roleIds");
  }
  // if data is there no need to call api
  if(data){
    return (dispatch) => {
      if(MULTITENANCY_ENABLED){
        dispatch(setTenantData(JSON.parse(data)));
        data = JSON.parse(data.form);
      }else{
        data = JSON.parse(data);
      }
      dispatch(setRoleIds(data));
      dispatch(setAccessForForm(data));
      done(null,data?.form);
    };
  }else{
    let url = MULTITENANCY_ENABLED ? API.GET_TENANT_DATA : API.FORMIO_ROLES;
    
    return (dispatch) => {
      httpGETRequest(url, {}, UserService.getToken(), true)
        .then((res) => {
          if (res.data) {
            dispatch(setRoleIds(res.data?.from));
            dispatch(setAccessForForm(res.data?.from));
            if(MULTITENANCY_ENABLED){
              dispatch(setTenantData(res.data));
            }
            done(null, res.data.form);
          } else {
           if(MULTITENANCY_ENABLED){
            dispatch(setTenantData({}));
           }
           done(res, null);
          }
        })
        .catch((error) => {
          console.log(error);
          if(MULTITENANCY_ENABLED){
            dispatch(setTenantData({}));
          }
          done(error, null);
        });
    };
  } 
};

 