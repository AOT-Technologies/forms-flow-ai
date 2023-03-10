/* istanbul ignore file */
import { httpGETRequest } from "../httpRequestHandler";
import API from "../endpoints";
import UserService from "../../services/UserService";
import { serviceActionError } from "../../actions/bpmTaskActions";

import {
  setBPMFormList,
  setBPMFormListLoading,
  setBpmFormLoading,
} from "../../actions/formActions";
import { replaceUrl } from "../../helper/helper";
import { setFormSearchLoading } from "../../actions/checkListActions";
import { setBundleForms } from "../../actions/bundleActions";

export const fetchBPMFormList = (
  pageNo,
  limit,
  sortBy,
  sortOrder,
  formName,
  formType,
  canBundle,
  ...rest
) => {
  const done = rest.length ? rest[0] : () => {};
  return (dispatch) => {
    let url = `${API.FORM}?pageNo=${pageNo}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
    if(formType){
      url += `&formType=${formType}`;
    }

    if (formName) {
      url += `&formName=${formName}`;
    }
    if (canBundle) {
      url += `&canBundle=${canBundle}`;
    }
    httpGETRequest(url, {}, UserService.getToken())
      .then((res) => {
        if (res.data) {
          if(canBundle){
            dispatch(setBundleForms({forms:res.data.forms,totalCount:res.data.totalCount}));
          }else{
            dispatch(setBPMFormList(res.data));
            dispatch(setBPMFormListLoading(false));
            //dispatch(setBPMLoader(false));
            dispatch(setBpmFormLoading(false));
            dispatch(setFormSearchLoading(false));
          }


          done(null, res.data);
        } else {
          dispatch(setBPMFormListLoading(false));
          //console.log("Error", res);
          dispatch(serviceActionError(res));
          dispatch(setFormSearchLoading(false));
          //dispatch(setBPMTaskLoader(false));
        }
      })
      .catch((error) => {
        //console.log("Error", error);
        dispatch(setBPMFormListLoading(false));
        dispatch(serviceActionError(error));
        //dispatch(setBPMTaskLoader(false));
        done(error);
      });
  };
};

export const fetchCanBundleForms = (options)=>{
  const {pageNo,formName,limit = 5,sortBy = "formName",sortOrder = "asc",canBundle} = options;
  let url = 
  `${API.FORM}?pageNo=${pageNo}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}&canBundle=${
    canBundle}`;
  if (formName) {
    url += `&formName=${formName}`;
  }
  return httpGETRequest(url, {}, UserService.getToken());
};



export const fetchFormByAlias = (path, ...rest) => {
  const done = rest.length ? rest[0] : () => {};

  const apiUrlGetFormByAlias = replaceUrl(
    API.GET_FORM_BY_ALIAS,
    "<form_path>",
    path
  );

  return (dispatch) => {
    let token = UserService.getFormioToken() ? {"x-jwt-token": UserService.getFormioToken()} : {};
    httpGETRequest(apiUrlGetFormByAlias, {}, "", false, {
      ...token
    })
      .then((res) => {
        if (res.data) {
          done(null, res.data);
        } else {
          dispatch(serviceActionError(res));
          //dispatch(setBPMTaskLoader(false));
        }
      })
      .catch((error) => {
        //console.log("Error", error);
        dispatch(serviceActionError(error));
        //dispatch(setBPMTaskLoader(false));
        done(error);
      });
  };
};




export const fetchFormById = (id) => {
  let token = UserService.getFormioToken() ? {"x-jwt-token": UserService.getFormioToken()} : {};
  return httpGETRequest(`${API.GET_FORM_BY_ID}/${id}`, {}, "", false, {
    ...token
  });
  
};

