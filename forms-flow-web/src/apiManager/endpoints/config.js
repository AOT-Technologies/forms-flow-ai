export const WEB_BASE_URL =
  (window._env_ && window._env_.REACT_APP_WEB_BASE_URL) ||
  process.env.REACT_APP_WEB_BASE_URL;

export const GRAPHQL_URL =
  (window._env_ && window._env_.REACT_APP_GRAPHQL_API_URL) ||
  process.env.REACT_APP_GRAPHQL_API_URL;

export const DOCUMENT_SERVICE_URL =
  (window._env_ && window._env_.REACT_APP_DOCUMENT_SERVICE_URL) ||
  process.env.REACT_APP_DOCUMENT_SERVICE_URL;

export const WEB_BASE_CUSTOM_URL =
  (window._env_ && window._env_.REACT_APP_WEB_BASE_CUSTOM_URL) ||
  process.env.REACT_APP_WEB_BASE_CUSTOM_URL;


export const CUSTOM_SUBMISSION_URL =
  (window._env_ && window._env_.REACT_APP_CUSTOM_SUBMISSION_URL) ||
  process.env.REACT_APP_CUSTOM_SUBMISSION_URL;

 export const BPM_BASE_URL_EXT = `${
   (window._env_ && window._env_.REACT_APP_BPM_URL) ||
   process.env.REACT_APP_BPM_URL
 }/engine-rest-ext`;

export const BPM_API_URL_WITH_VERSION = `${BPM_BASE_URL_EXT}/v1`;

export const BPM_BASE_URL_SOCKET_IO = `${
  (window._env_ && window._env_.REACT_APP_BPM_URL) ||
  process.env.REACT_APP_BPM_URL
}/forms-flow-bpm-socket`;

export const MT_ADMIN_BASE_URL = `${
  (window._env_ && window._env_.REACT_APP_MT_ADMIN_BASE_URL) ||
  process.env.REACT_APP_MT_ADMIN_BASE_URL
}`;

export const MT_ADMIN_BASE_URL_VERSION = `${
  (window._env_ && window._env_.REACT_APP_MT_ADMIN_BASE_URL_VERSION) ||
  process.env.REACT_APP_MT_ADMIN_BASE_URL_VERSION ||
  "v1"
}`;

export const KEYCLOAK_ENABLE_CLIENT_AUTH =
  (window._env_ && window._env_.REACT_APP_KEYCLOAK_ENABLE_CLIENT_AUTH) ||
  process.env.REACT_APP_KEYCLOAK_ENABLE_CLIENT_AUTH;
