window['_env_'] =  {
  // To define project level configuration  possible values development,test, production
  "NODE_ENV": "development",
  //Environment Variables for forms-flow-web

  // KEYCLOAK-CLIENT-Roles

  "REACT_APP_CLIENT_ROLE": "rpas-client",
  "REACT_APP_STAFF_DESIGNER_ROLE": "rpas-formdesigner",
  "REACT_APP_STAFF_REVIEWER_ROLE": "rpas-reviewer",
  // Role Id's from forms-flow-forms
  // Form-IO-Client-Id
  "REACT_APP_CLIENT_ID": "<Form-IO-SERVERS Client role-Id>",
  // Form-IO-Reviewer-Id
  "REACT_APP_STAFF_REVIEWER_ID": "<Form-IO-SERVERS Reviewer role-Id>",
  // Form-IO-Administrator-Id
  "REACT_APP_STAFF_DESIGNER_ID": "<Form-IO-SERVERS Administrator role-Id>",
  // Form-IO USER FORM FORM_ID
  "REACT_APP_USER_RESOURCE_FORM_ID": "<Form-IO-SERVERS User forms form-Id>",
  //Submission-group in Email Notification
  "REACT_APP_EMAIL_SUBMISSION_GROUP"="rpas/rpas-reviewer",
  /*URL of forms-flow-forms
   Form-IO API-URL*/
  "REACT_APP_API_SERVER_URL": "http: //localhost:3001",
  // Form-IO API-PROJECT-URL
  "REACT_APP_API_PROJECT_URL": "http: //localhost:3001",
  // Keycloak-client-name for web
  "REACT_APP_KEYCLOAK_CLIENT": "forms-flow-web",
  ////Environment Variables for forms-flow-bpm////

  // BPM-API-URL
  "REACT_APP_BPM_API_BASE": "http: //localhost:8000",
  // BPM TOKEN URL
  "REACT_APP_BPM_TOKEN_API": "<KEYCLOAK-BASE-URL>/auth/realms/forms-flow-ai/protocol/openid-connect/token",
  // Secret Key for BPM
  "REACT_APP_BPM_CLIENT_ID": "<BPM CLIENT SECRET KEY HERE>",
  // Keycloak-client-name for BPM
  "REACT_APP_KEYCLOAK_BPM_CLIENT": "forms-flow-bpm"
}
