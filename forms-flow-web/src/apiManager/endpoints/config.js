export const BPM_BASE_URL = `${window._env_.REACT_APP_BPM_API_BASE || process.env.REACT_APP_BPM_API_BASE}/camunda/engine-rest`;
export const BPM_TOKEN_URL = window._env_.REACT_APP_BPM_TOKEN_API || process.env.REACT_APP_BPM_TOKEN_API;
export const PROCESS_BASE_API = `${window._env_.REACT_APP_BPM_API_BASE || process.env.REACT_APP_BPM_API_BASE}/camunda/engine-rest/process-definition/key/`;
export const INSIGHTS_BASE_API= `${window._env_.REACT_APP_INSIGHT_API_BASE || process.env.REACT_APP_INSIGHT_API_BASE}/api`;

export default {
  BPM_BASE_URL,
  BPM_TOKEN_URL,
  PROCESS_BASE_API,
  INSIGHTS_BASE_API
}
