import {  httpPOSTRequest, httpGETRequest, httpPUTRequest} from "../httpRequestHandler";
// httpGETRequest,
import API from "../endpoints";
import UserService from "../../services/UserService";
import { setCustomSubmission } from "../../actions/checkListActions";
import { replaceUrl } from "../../helper/helper";

export const formCreate = (formData, ...rest) => {
  const done = rest.length ? rest[0] : () => {};
  httpPOSTRequest(API.FORM_CREATION,formData,UserService.getToken()).then(res=>{
    if(res.data){
     done(null,res.data);
    }
   }).catch((err)=>{
    if(err.response?.data){
      done(err.response.data);
    }else{
      done(err.message);
    } 
   });
};

export const postCustomSubmission = (data,formId,isPublic,...rest)=>{
  const done = rest.length ? rest[0] : () => {};
  let newUrl = isPublic ? replaceUrl(API.PUBLIC_CUSTOM_SUBMISSION,"<form_id>",formId) : replaceUrl(API.CUSTOM_SUBMISSION,"<form_id>",formId);
  httpPOSTRequest(`${newUrl}`,data,UserService.getToken())
  .then((res)=>{
    if(res.data){
      done(null,res.data);
    }
  }).catch((err)=>{
    done(err,null);
  });
};

export const updateCustomSubmission = (data,formId,...rest)=>{
  const done = rest.length ? rest[0] : () => {};
  let newUrl = replaceUrl(API.CUSTOM_SUBMISSION,"<form_id>",formId);
  httpPUTRequest(`${newUrl}/${data._id}`,data,
  UserService.getToken())
  .then((res)=>{
    if(res.data){
      done(null,res.data);
    }
  }).catch((err)=>{
    done(err,null);
  });
};


export const getCustomSubmission = (submissionId,formId,...rest)=>{
  const done = rest.length ? rest[0] : () => {};
  let newUrl = replaceUrl(API.CUSTOM_SUBMISSION,"<form_id>",formId);

  return (dispatch)=>{
    httpGETRequest(`${newUrl}/${submissionId}`,
    {},UserService.getToken())
    .then((res)=>{
      if(res.data){
        dispatch(setCustomSubmission(res.data));
      }
    }).catch((err)=>{
      done(err,null);
    });
  };
};
