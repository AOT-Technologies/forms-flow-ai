// export const INSIGHTS_BASE_API = `${(window._env_ && window._env_.REACT_APP_INSIGHT_API_BASE) ||
//   process.env.REACT_APP_INSIGHT_API_BASE}/api`;
// export const INSIGHTS_API_KEY =
//   (window._env_ && window._env_.REACT_APP_INSIGHTS_API_KEY) ||
//   process.env.REACT_APP_INSIGHTS_API_KEY;
export const WEB_BASE_URL =
  (window._env_ && window._env_.REACT_APP_WEB_BASE_URL) ||
  process.env.REACT_APP_WEB_BASE_URL;

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
