export const BPM_USER_DETAILS = {
  client_id: process.env.REACT_APP_KEYCLOAK_BPM_CLIENT || 'forms-flow-bpm',
  client_secret: process.env.REACT_APP_BPM_CLIENT_ID,
  grant_type:'client_credentials'
};
