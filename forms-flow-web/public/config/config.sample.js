window["_env_"] = {
  // To define project level configuration  possible values development,test, production
  NODE_ENV: "development",
  //Environment Variables for forms-flow-web

  // KEYCLOAK-CLIENT-Roles

  REACT_APP_CLIENT_ROLE: "formsflow-client",
  REACT_APP_STAFF_DESIGNER_ROLE: "formsflow-designer",
  REACT_APP_STAFF_REVIEWER_ROLE: "formsflow-reviewer",
  // Role Id's from forms-flow-forms
  // Form-IO-Client-Id
  REACT_APP_CLIENT_ID: "<Form-IO-SERVERS Client role-Id>",
  // Form-IO-Reviewer-Id
  REACT_APP_STAFF_REVIEWER_ID: "<Form-IO-SERVERS Reviewer role-Id>",
  // Form-IO-Administrator-Id
  REACT_APP_STAFF_DESIGNER_ID: "<Form-IO-SERVERS Administrator role-Id>",
  REACT_APP_ANONYMOUS_ID: "<Form-IO-SERVERS Anonymous role-Id>",

  // Form-IO USER FORM FORM_ID
  REACT_APP_USER_RESOURCE_FORM_ID: "<Form-IO-SERVERS User forms form-Id>",
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
  REACT_APP_CAMUNDA_API_URI:"Camunda base API",
  REACT_APP_WEBSOCKET_ENCRYPT_KEY:"Web Socket encrypt key for Socket IO",
  //application name
  REACT_APP_APPLICATION_NAME:"formsflow.ai",
  //custom url
  REACT_APP_WEB_BASE_CUSTOM_URL:"Custom URL",
  REACT_APP_FORMIO_JWT_SECRET:"Jwt secret key",
  REACT_APP_USER_ACCESS_PERMISSIONS:{accessAllowApplications:false, accessAllowSubmissions:false}

};
