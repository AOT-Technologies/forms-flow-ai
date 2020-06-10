import axios from "axios";

import Token from "../token/tokenService";

const qs = require("querystring");

export const httpGETRequest = (url, data, token) => {
  return axios.get(url, {
    params: data,
    headers: { Authorization: `Bearer ${token || Token.getBpmToken()}` },
  });
};

export const httpPOSTRequest = (url, data, token) => {
  return axios.post(url, data, { headers: { Authorization: `Bearer ${ token || Token.getBpmToken()}` } });
};

export const httpPOSTRequestWithoutToken = (url, data) => {
  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  return axios.post(url, qs.stringify(data), config);
};

export const httpGETRequestWithoutToken = (url, token) => {
  return axios.get(url);
};
