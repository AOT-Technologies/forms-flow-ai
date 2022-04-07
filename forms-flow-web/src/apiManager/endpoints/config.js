// export const INSIGHTS_BASE_API = `${(window._env_ && window._env_.REACT_APP_INSIGHT_API_BASE) ||
//   process.env.REACT_APP_INSIGHT_API_BASE}/api`;
// export const INSIGHTS_API_KEY =
//   (window._env_ && window._env_.REACT_APP_INSIGHTS_API_KEY) ||
//   process.env.REACT_APP_INSIGHTS_API_KEY;
export const WEB_BASE_URL = (window._env_ && window._env_.REACT_APP_WEB_BASE_URL) || process.env.REACT_APP_WEB_BASE_URL;

export const WEB_BASE_CUSTOM_URL = (window._env_ && window._env_.REACT_APP_WEB_BASE_CUSTOM_URL) || process.env.REACT_APP_WEB_BASE_CUSTOM_URL;

export const BPM_BASE_URL = `${(window._env_ && window._env_.REACT_APP_CAMUNDA_API_URI) || process.env.REACT_APP_CAMUNDA_API_URI}/engine-rest`;

// export const BPM_BASE_URL_EXT = `${(window._env_ && window._env_.REACT_APP_CAMUNDA_API_URI) || process.env.REACT_APP_CAMUNDA_API_URI}/engine-rest-ext`;
// export const BPM_PROCESS_BASE_API = `${BPM_BASE_URL}/process-definition/key/`;

export const BPM_BASE_URL_SOCKET_IO = `${(window._env_ && window._env_.REACT_APP_CAMUNDA_API_URI) || process.env.REACT_APP_CAMUNDA_API_URI}/forms-flow-bpm-socket`;
