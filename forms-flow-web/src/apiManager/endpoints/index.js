import {BASE_API_URL, BASE_TOKEN_URL} from './config';

const API = {
  GET_BPM_TOKEN: BASE_TOKEN_URL,
  SEND_EMAIL_NOTIFICATION: BASE_API_URL + 'EmailNotification/start'
}

export default API;
