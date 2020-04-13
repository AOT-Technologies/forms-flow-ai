import {  httpPOSTRequest } from '../httpRequestHandler'
import API from '../endpoints'

import { sendEmailNotification, serviceActionError } from '../../actions/bpmActions'

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

