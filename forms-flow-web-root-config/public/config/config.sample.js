window["_env_"] = {
  // To define project level configuration  possible values development, test, production
  NODE_ENV: "development",
  // Environment Variables for forms-flow-web

  /* URL of forms-flow-forms
   Form-IO API-URL, default: https://{your-ip-address}:5000/api */
  REACT_APP_API_SERVER_URL: "<Forms-flow-forms URL>",

  // Form-IO API-PROJECT-URL, default: http://{your-ip-address}:3001
  REACT_APP_API_PROJECT_URL: "<Forms-flow-forms URL>",
  
  // Keycloak-client-name for web
  REACT_APP_KEYCLOAK_CLIENT: "forms-flow-web",
  // Keycloak-Realm-name
  REACT_APP_KEYCLOAK_URL_REALM: "forms-flow-ai",
  // Keycloak URL, default: http://{your-ip-address}:8080
  REACT_APP_KEYCLOAK_URL: "<Keycloak URL>",

  //// Environment Variables for forms-flow-bpm ////
  // bpm base api, default: http://{your-ip-address}:8000/camunda
  REACT_APP_BPM_URL: "<Camunda base API>",

//Web Socket encrypt key for Socket IO
  REACT_APP_WEBSOCKET_ENCRYPT_KEY: "giert989jkwrgb@DR55",

  // web Api End point, default: http://{your-ip-address}:3004/single-spa-build.js
  REACT_APP_WEB_BASE_URL: "<Web Api base end-point>",

  // application name
  REACT_APP_APPLICATION_NAME: "formsflow.ai",

  // custom url to set into local Storage, eg: https://formsflow.ai
  REACT_APP_WEB_BASE_CUSTOM_URL: "<Custom URL>",

  // For Custom Submission/Form Adapter Enabled
  REACT_APP_CUSTOM_SUBMISSION_URL: "<Custom Submission URL>",
  REACT_APP_CUSTOM_SUBMISSION_ENABLED: false,
  REACT_APP_ENABLE_APPLICATION_ACCESS_PERMISSION_CHECK: false,
  // Enable Draft feature
  REACT_APP_DRAFT_ENABLED: false,
  REACT_APP_DRAFT_POLLING_RATE: 15000,
  // Enable Export Pdf feature
  REACT_APP_EXPORT_PDF_ENABLED: false,

  // Document Service api hosted from forms-flow-documents, default: http://{your-ip-address}:5006
  REACT_APP_DOCUMENT_SERVICE_URL: "<Custom Document URL>",

  // Enable Multitenancy
  REACT_APP_MULTI_TENANCY_ENABLED: false,
  // Enable creating workflow for all tenants
  REACT_APP_PUBLIC_WORKFLOW_ENABLED: false,
  // Multitenancy Admin Api endpoint Required only if Multitenancy is enabled, default: http://{your-ip-address}:5010/api
  REACT_APP_MT_ADMIN_BASE_URL: "<Multitenancy Admin Api Endpoint>",
  // Version of multitenancy admin api
  REACT_APP_MT_ADMIN_BASE_URL_VERSION: "v1",

  // Need to Enable for Multitenancy - When Enabled true uses keycloak client Roles
  // else will use Keycloak groups concept for Role checks
  REACT_APP_KEYCLOAK_ENABLE_CLIENT_AUTH: false,

  // Only use if need to disable a particular module in forms-flow-web, default is true for all.
  REACT_APP_ENABLE_FORMS_MODULE: true,
  REACT_APP_ENABLE_TASKS_MODULE: true,
  REACT_APP_ENABLE_DASHBOARDS_MODULE: true,
  REACT_APP_ENABLE_PROCESSES_MODULE: true,
  REACT_APP_ENABLE_APPLICATIONS_MODULE: true,

   /* You can provide custom theme by adding json data to following path
  public/themeConfig/customTheme.json inside forms-flow-web-root-config.
  the json data should be below format.
  `{
  "--navbar-background": "blue",
  "--navbar-items": "grey",
  "--navbar-active": "white"
  }`
  */
  // REACT_APP_CUSTOM_THEME_URL: "<CUSTOM_THEME_URL>",

 /**
  * CUSTOM_RESOURCE_BUNDLE_URL
    You can provide custom resource bundle for internationalization by adding json data to following path
    public/languageConfig/customResourceBundle.json inside forms-flow-web-root-config.
    the json data should be below format.
    {
      "language1": {
        "key": "value"
      },
      "language2": {
        "key": "value"
      }
    }
    REACT_APP_CUSTOM_RESOURCE_BUNDLE_URL: <CUSTOM_RESOURCE_BUNDLE_URL>
  */

  /**
  Add date and time format default will be DD-MM-YY and hh:mm:ss A
    #DATE_FORMAT=DD-MM-YY
    #TIME_FORMAT=hh:mm:ss A
  */  
};
