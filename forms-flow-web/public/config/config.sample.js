window["_env_"] = {
  // To define project level configuration  possible values development,test, production
  NODE_ENV: "development",
  //Environment Variables for forms-flow-web

  /*URL of forms-flow-forms
   Form-IO API-URL*/
  REACT_APP_API_SERVER_URL: "http://localhost:3001",
  // Form-IO API-PROJECT-URL
  REACT_APP_API_PROJECT_URL: "http://localhost:3001",
  // Keycloak-client-name for web
  REACT_APP_KEYCLOAK_CLIENT: "forms-flow-web",
  // Keycloak-Realm-name
  REACT_APP_KEYCLOAK_URL_REALM:"forms-flow-ai",
  // Keycloak URL
  REACT_APP_KEYCLOAK_URL:"<Keycloak URL>",

  ////Environment Variables for forms-flow-bpm////

  //Insight Api End point
  //REACT_APP_INSIGHT_API_BASE: "Insight Api base end-point",
  //REACT_APP_INSIGHTS_API_KEY: "<API_KEY from REDASH>",
  //web Api End point
  REACT_APP_WEB_BASE_URL: "Web Api base end-point",
  //bpm base api
  REACT_APP_BPM_URL:"Camunda base API",
  REACT_APP_WEBSOCKET_ENCRYPT_KEY:"Web Socket encrypt key for Socket IO",
  //application name
  REACT_APP_APPLICATION_NAME:"formsflow.ai",
  //custom url
  REACT_APP_WEB_BASE_CUSTOM_URL:"Custom URL",
  REACT_APP_CUSTOM_SUBMISSION_URL:"Custom Submission URL",
  REACT_APP_FORMIO_JWT_SECRET:"Jwt secret key",
  REACT_APP_CUSTOM_SUBMISSION_ENABLED:'false',
  REACT_APP_USER_ACCESS_PERMISSIONS:{accessAllowApplications:false, accessAllowSubmissions:false},
  REACT_APP_MULTI_TENANCY_ENABLED:'false',
  REACT_APP_DRAFT_ENABLED: 'false',
  REACT_APP_DRAFT_POLLING_RATE: 15000,
  REACT_APP_EXPORT_PDF_ENABLED: 'false',
  REACT_APP_DOCUMENT_SERVICE_URL:"Custom URL",
};
