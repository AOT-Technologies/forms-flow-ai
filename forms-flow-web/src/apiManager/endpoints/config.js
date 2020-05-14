export const BPM_BASE_URL = `${window._env_.REACT_APP_BPM_API_BASE || process.env.REACT_APP_BPM_API_BASE}/camunda/engine-rest`; //window._env_.REACT_APP_BPM_API_BASE || process.env.REACT_APP_BPM_API_BASE +
export const PROCESS_BASE_API = `${window._env_.REACT_APP_BPM_API_BASE || process.env.REACT_APP_BPM_API_BASE}/camunda/engine-rest/process-definition/key/`; //window._env_.REACT_APP_BPM_API_BASE ||process.env.REACT_APP_BPM_API_BASE +

export default {
  BPM_BASE_URL,
  PROCESS_BASE_API,
}
