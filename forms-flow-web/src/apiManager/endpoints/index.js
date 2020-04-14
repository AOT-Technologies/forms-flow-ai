import {BASE_API_URL, BPM_TOKEN_URL} from './config';

const API = {
  GET_BPM_TOKEN: BPM_TOKEN_URL,
  SEND_EMAIL_NOTIFICATION: BASE_API_URL + 'EmailNotification/start'
}
//TODO update the process to read from json/API

export default API;
