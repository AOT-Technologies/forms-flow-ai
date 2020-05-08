export const BPM_USER_DETAILS = {
  client_id: window._env_.REACT_APP_KEYCLOAK_BPM_CLIENT || process.env.REACT_APP_KEYCLOAK_BPM_CLIENT || 'forms-flow-bpm',
  client_secret: window._env_.REACT_APP_BPM_CLIENT_ID || process.env.REACT_APP_BPM_CLIENT_ID,
  grant_type:'client_credentials'
};
