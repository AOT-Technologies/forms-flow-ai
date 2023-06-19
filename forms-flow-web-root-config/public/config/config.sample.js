window["_env_"] = {
  // To define project level configuration  possible values development, test, production
  NODE_ENV: "development",
  // Environment Variables for forms-flow-web

  /* URL of forms-flow-forms
   Form-IO API-URL */
  REACT_APP_API_SERVER_URL: "<Forms-flow-forms URL>",
  // Form-IO API-PROJECT-URL
  REACT_APP_API_PROJECT_URL: "<Forms-flow-forms URL>",
  // Keycloak-client-name for web
  REACT_APP_KEYCLOAK_CLIENT: "forms-flow-web",
  // Keycloak-Realm-name
  REACT_APP_KEYCLOAK_URL_REALM: "forms-flow-ai",
  // Keycloak URL
  REACT_APP_KEYCLOAK_URL: "<Keycloak URL>",

  //// Environment Variables for forms-flow-bpm ////
  // bpm base api
  REACT_APP_BPM_URL: "<Camunda base API>",
  REACT_APP_WEBSOCKET_ENCRYPT_KEY: "<Web Socket encrypt key for Socket IO>",

  // web Api End point
  REACT_APP_WEB_BASE_URL: "<Web Api base end-point>",

  // application name
  REACT_APP_APPLICATION_NAME: "formsflow.ai",
  // custom url to set into local Storage
  REACT_APP_WEB_BASE_CUSTOM_URL: "<Custom URL>",
  // For Custom Submission/Form Adapter Enabled
  REACT_APP_CUSTOM_SUBMISSION_URL: "<Custom Submission URL>",
  REACT_APP_CUSTOM_SUBMISSION_ENABLED: false,
  REACT_APP_USER_ACCESS_PERMISSIONS: {
    accessAllowApplications: false,
    accessAllowSubmissions: false,
  },
  // Enable Draft feature
  REACT_APP_DRAFT_ENABLED: false,
  REACT_APP_DRAFT_POLLING_RATE: 15000,
  // Enable Export Pdf feature
  REACT_APP_EXPORT_PDF_ENABLED: false,

  // Document Service api hosted from forms-flow-documents
  REACT_APP_DOCUMENT_SERVICE_URL: "<Custom Document URL>",

  // Enable Multitenancy
  REACT_APP_MULTI_TENANCY_ENABLED: false,
  // Enable creating workflow for all tenants
  REACT_APP_PUBLIC_WORKFLOW_ENABLED: false,
  // Multitenancy Admin Api endpoint Required only if Multitenancy is enabled
  REACT_APP_MT_ADMIN_BASE_URL: "<Multitenancy Admin Api Endpoint>",
  // Version of multitenancy admin api
  REACT_APP_MT_ADMIN_BASE_URL_VERSION: "v1",

  // Need to Enable for Multitenancy - When Enabled true uses keycloak client Roles
  // else will use Keycloak groups concept for Role checks
  REACT_APP_KEYCLOAK_ENABLE_CLIENT_AUTH: false,

  // Only use if need to disable a particular module in forms-flow-web, default is true for all.
  ENABLE_FORMS_MODULE: true,
  ENABLE_TASKS_MODULE: true,
  ENABLE_DASHBOARDS_MODULE: true,
  ENABLE_PROCESSES_MODULE: true,
  ENABLE_APPLICATIONS_MODULE: true,

  /* TODO Remove the MF variables from config.js Not being used anywhere as these are build time variables passed with .env only
  // The MF Variables below are used to get MicroFrontend Components Created
  // For running locally or if have custom changes then change the url to the one forms-flow-web folder content is running
  MF_FORMSFLOW_WEB_URL: "https://s3.ap-northeast-1.amazonaws.com/formsflow.ai-micro-front-ends/forms-flow-web/single-spa-build.gz.js",
  // Refer Github Repo https://github.com/AOT-Technologies/forms-flow-ai-micro-front-ends and update to your own custom implementation for the Components here
  MF_FORMSFLOW_NAV_URL: "https://s3.ap-northeast-1.amazonaws.com/formsflow.ai-micro-front-ends/forms-flow-nav/forms-flow-nav.gz.js",
  MF_FORMSFLOW_SERVICE_URL: "https://s3.ap-northeast-1.amazonaws.com/formsflow.ai-micro-front-ends/forms-flow-service/forms-flow-service.gz.js",
  MF_FORMSFLOW_ADMIN_URL: "https://s3.ap-northeast-1.amazonaws.com/formsflow.ai-micro-front-ends/forms-flow-admin/forms-flow-admin.gz.js",
  MF_FORMSFLOW_THEME_URL: "https://s3.ap-northeast-1.amazonaws.com/formsflow.ai-micro-front-ends/forms-flow-theme/forms-flow-theme.gz.js",
  */

  /* Used for providing theming configuration in a url that returns json format
  Example to change the theme a theme.json can be given with content:
  `{
  "--navbar-background": "blue",
  "--navbar-items": "grey",
  "--navbar-active": "white"
  }`
  */
  // CUSTOM_THEME_URL: "<custom theme URl>",
};