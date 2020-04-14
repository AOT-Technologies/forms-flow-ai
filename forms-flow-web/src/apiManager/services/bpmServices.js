import {  httpPOSTRequest, httpPOSTRequestWithoutToken } from '../httpRequestHandler'
import API from '../endpoints'

import { setUserToken, sendEmailNotification, serviceActionError } from '../../actions/bpmActions'
import Token from "../token/tokenService"

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

export const  triggerEmailNotification= (data, ...rest) => {
  const done = rest.length ? rest[0] :  ()=>{};
  return dispatch => {
    httpPOSTRequest(API.SEND_EMAIL_NOTIFICATION,data).then(res => {
      if (res.data) {
        dispatch(sendEmailNotification(res.data))
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

