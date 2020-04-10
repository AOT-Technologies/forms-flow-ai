import config from './config'

const BASE_API_URL = config.BASE_API_URL;
const BASE_TOKEN_URL = config.BASE_TOKEN_URL;

const API = {
  GET_BPM_TOKEN: BASE_TOKEN_URL,
  SEND_EMAIL_NOTIFICATION: BASE_API_URL + 'EmailNotification/start'
}

export default API;
