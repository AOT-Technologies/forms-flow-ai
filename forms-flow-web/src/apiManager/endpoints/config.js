export const BPM_BASE_URL = "/camunda/engine-rest"; //window._env_.REACT_APP_BPM_API_BASE || process.env.REACT_APP_BPM_API_BASE +
export const BPM_TOKEN_URL = window._env_.REACT_APP_BPM_TOKEN_API || process.env.REACT_APP_BPM_TOKEN_API;
export const PROCESS_BASE_API = "/camunda/engine-rest/process-definition/key/"; //window._env_.REACT_APP_BPM_API_BASE ||process.env.REACT_APP_BPM_API_BASE +

export default {
  BPM_BASE_URL,
  BPM_TOKEN_URL,
  PROCESS_BASE_API,
}
