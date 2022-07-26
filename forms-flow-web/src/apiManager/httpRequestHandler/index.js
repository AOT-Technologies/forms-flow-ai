import axios from "axios";

import UserService from "../../services/UserService";

// const qs = require("querystring");

export const httpGETRequest = (
  url,
  data,
  token,
  isBearer = true,
  headers = null
) => {
  return axios.get(url, {
    params: data,
    headers: !headers
      ? {
          Authorization: isBearer
            ? `Bearer ${token || UserService.getToken()}`
            : token,
        }
      : headers,
  });
};

export const httpGETBlobRequest = (
  url,
  data,
  token,
  isBearer = true,
  headers = null
) => {
  return axios.get(url, {
    params: data,
    responseType: "blob",
    headers: !headers
      ? {
          Authorization: isBearer
            ? `Bearer ${token || UserService.getToken()}`
            : token,
        }
      : headers,
  });
};

export const httpPOSTRequest = (
  url,
  data,
  token,
  isBearer = true,
  headers = null
) => {
  return axios.post(url, data, {
    headers: !headers
      ? {
          Authorization: isBearer
            ? `Bearer ${token || UserService.getToken()}`
            : token,
        }
      : headers,
  });
};

export const httpPOSTRequestWithoutToken = (url, data) => {
  return axios.post(url, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const httpPOSTRequestWithHAL = (url, data, token, isBearer = true) => {
  return axios.post(url, data, {
    headers: {
      Authorization: isBearer
        ? `Bearer ${token || UserService.getToken()}`
        : token,
      Accept: "application/hal+json",
    },
  });
};

export const httpPUTRequest = (url, data, token, isBearer = true) => {
  return axios.put(url, data, {
    headers: {
      Authorization: isBearer
        ? `Bearer ${token || UserService.getToken()}`
        : token,
    },
  });
};

export const httpDELETERequest = (url, token, isBearer = true) => {
  return axios.delete(url, {
    headers: {
      Authorization: isBearer
        ? `Bearer ${token || UserService.getToken()}`
        : token,
    },
  });
};

export const httpPUTRequestWithoutToken = (url, data) => {
  return axios.put(url, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
