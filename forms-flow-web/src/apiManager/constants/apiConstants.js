export const BPM_USER_DETAILS = {
  client_id: process.env.REACT_APP_KEYCLOAK_BPM_CLIENT || 'forms-flow-bpm',
  client_secret: process.env.REACT_APP_BPM_CLIENT_ID || '3dd8d977-f9e0-43b8-9b56-72ad8349b3ea',
  grant_type:'client_credentials'
};
