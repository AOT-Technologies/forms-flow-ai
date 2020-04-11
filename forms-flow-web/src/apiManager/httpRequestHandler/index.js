import axios from 'axios'

import Token from '../token/tokenService'
const qs = require('querystring');

export const httpGETRequest = (url, data) => {
  console.log(data)
  return axios.get(url, { params: data, headers: { Authorization: Token.getToken() } }) // TODO get this dynamic from url
}

export const httpPOSTRequest = (url, data) => {
  const token = `Bearer ${Token.getBpmToken()}`;
  return axios.post(url, data, { headers: { Authorization: token } }) // TODO get this dynamic from url
}

export const httpPOSTRequestWithoutToken = (url, data) => {
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
