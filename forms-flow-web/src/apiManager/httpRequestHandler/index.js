import axios from 'axios'

import Token from '../token/tokenService'

const qs = require('querystring');

export const httpGETRequest = (url, data) => {
  return axios.get(url, { params: data, headers: { Authorization: Token.getBpmToken()}, mode:'no-cors'  }) // TODO get this dynamic from url
}

export const httpPOSTRequest = (url, data) => {
  console.log("post url",url);
  console.log("env inside post req",process.env);
  console.log("bpm", process.env.REACT_APP_BPM_API_BASE);
  const token = `Bearer ${Token.getBpmToken()}`;
  return axios.post(url, data, { headers: { Authorization: token , 'Access-Control-Allow-Origin':'*'} , crossDomain: true, mode:'no-cors' }) // TODO get this dynamic from url
}

export const httpPOSTRequestWithoutToken = (url, data) => {
  console.log("env inside post req",process.env);
  console.log("bpm env", process.env.REACT_APP_BPM_API_BASE);
  console.log("url",url);
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  return axios.post(url, qs.stringify(data), config) // TODO get this dynamic from url
}

export const httpGETRequestToken = (url, token) => {
  return axios.get(url, { headers: { Authorization: token } }) // TODO get this dynamic from url
}
