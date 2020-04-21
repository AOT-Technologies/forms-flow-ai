import {BASE_API_URL, BPM_TOKEN_URL} from './config';

const API = {
  BASE_API_URL: process.env.REACT_APP_BPM_API_BASE+'/camunda',
  GET_BPM_TOKEN: BPM_TOKEN_URL,
  SEND_NOTIFICATION: BASE_API_URL
}
//TODO update the process to read from json/API

export default API;
