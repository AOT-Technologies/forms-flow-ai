import {  httpPOSTRequest, httpPOSTRequestWithoutToken } from '../httpRequestHandler'
import API from '../endpoints'
import { setUserToken, sendEmailNotification, sendOneStepApproval, serviceActionError } from '../../actions/bpmActions'
import Token from "../token/tokenService"
import PROCESS from "../constants/processConstants";

export const getUserToken = (data, ...rest) => {
  const done = rest.length ? rest[0] :  ()=>{};
  return dispatch => {
    httpPOSTRequestWithoutToken(API.GET_BPM_TOKEN,data).then(res => {
      if (res.data) {
        //TODO update refresh token logic
        const token=`${res.data.access_token}`;
        Token.setBpmToken(token);
        dispatch(setUserToken(res.data))
        done(null,res);
      } else {
        dispatch(serviceActionError(res))
        done('Error Posting data');
      }
    }).catch((error) => {
      console.log(error)
      dispatch(serviceActionError(error))
      done(error);
    })
  }
};

export const getProcess = (processType,formId, submissionId) => {
  switch(processType){
    case PROCESS.EmailNotification :
      return {
        process: PROCESS.EmailNotification,
        service: sendEmailNotification,
        req: {
          "variables": {
            "category": { "value": "task_notification" },
            "formurl": { "value": `${window.location.origin}/form/${formId}/submission/${submissionId}` }
          }
        }
      }
      case PROCESS.OneStepApproval :
        return{
          process:PROCESS.OneStepApproval,
          service: sendOneStepApproval,
          req: {
            "variables": {
              "formurl": { "value": `${window.location.origin}/form/${formId}/submission/${submissionId}` },
              "submissionid":{"value":{submissionId}},
              "formid":{"value":{formId}}
            },
          }
      }
    default: return null
  }
}

export const  triggerNotification= (data, ...rest) => {
  const done = rest.length ? rest[0] :  ()=>{};
  let url = API.SEND_NOTIFICATION+`${data.process}/start`
  return dispatch => {
    httpPOSTRequest(url,data.req).then(res => {
      if (res.data) {
        dispatch(data.service(res.data))
        done(null,res.data);
      } else {
        dispatch(serviceActionError(res))
        done('Error Posting data');
      }
    }).catch((error) => {
      dispatch(serviceActionError(error))
      done(error);
    })
  }
};

