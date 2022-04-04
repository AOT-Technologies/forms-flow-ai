//import Keycloak from "keycloak-js";
import { Translation } from "react-i18next";
//application details
export const APPLICATION_NAME =
  (window._env_ && window._env_.REACT_APP_APPLICATION_NAME) ||
  process.env.REACT_APP_APPLICATION_NAME ||
  "formsflow.ai";
//language details
export const LANGUAGE =
  (window._env_ && window._env_.REACT_APP_LANGUAGE) ||
  process.env.REACT_APP_LANGUAGE ||
  "en";
//custom url
export const WEB_BASE_CUSTOM_URL =
  (window._env_ && window._env_.REACT_APP_WEB_BASE_CUSTOM_URL) ||
  process.env.REACT_APP_WEB_BASE_CUSTOM_URL||"";

//keycloak
export const Keycloak_Client =
  (window._env_ && window._env_.REACT_APP_KEYCLOAK_CLIENT) ||
  process.env.REACT_APP_KEYCLOAK_CLIENT ||
  "forms-flow-web";
export const KEYCLOAK_REALM =
  (window._env_ && window._env_.REACT_APP_KEYCLOAK_URL_REALM) ||
  process.env.REACT_APP_KEYCLOAK_URL_REALM ||
  "forms-flow-ai";
export const KEYCLOAK_URL =(window._env_ && window._env_.REACT_APP_KEYCLOAK_URL) || process.env.REACT_APP_KEYCLOAK_URL;
export const KEYCLOAK_AUTH_URL = `${KEYCLOAK_URL}/auth`;


// export const _kc = new Keycloak("/config/kc/keycloak.json");

export const CLIENT =
  (window._env_ && window._env_.REACT_APP_CLIENT_ROLE) || process.env.REACT_APP_CLIENT_ROLE;
export const STAFF_DESIGNER =
  (window._env_ && window._env_.REACT_APP_STAFF_DESIGNER_ROLE) ||
  process.env?.REACT_APP_STAFF_DESIGNER_ROLE;
export const STAFF_REVIEWER =
  (window._env_ && window._env_.REACT_APP_STAFF_REVIEWER_ROLE) ||
  process.env.REACT_APP_STAFF_REVIEWER_ROLE;
export const ANONYMOUS_USER = "anonymous";

//default FORMIO_JWT_SECRET is --- change me now ---
export const FORMIO_JWT_SECRET =
  (window._env_ && window._env_.REACT_APP_FORMIO_JWT_SECRET) || process.env.REACT_APP_FORMIO_JWT_SECRET || "--- change me now ---";

export const USER_RESOURCE_FORM_ID =
  (window._env_ && window._env_.REACT_APP_USER_RESOURCE_FORM_ID) ||
  process.env.REACT_APP_USER_RESOURCE_FORM_ID;

const CLIENT_ID =
  (window._env_ && window._env_.REACT_APP_CLIENT_ID) || process.env.REACT_APP_CLIENT_ID;
const STAFF_REVIEWER_ID =
  (window._env_ && window._env_.REACT_APP_STAFF_REVIEWER_ID) ||
  process.env.REACT_APP_STAFF_REVIEWER_ID;
const STAFF_DESIGNER_ID =
  (window._env_ && window._env_.REACT_APP_STAFF_DESIGNER_ID) ||
  process.env.REACT_APP_STAFF_DESIGNER_ID;
export const ANONYMOUS_ID =
  (window._env_ && window._env_.REACT_APP_ANONYMOUS_ID) || process.env.REACT_APP_ANONYMOUS_ID;

export const ROLES = [
  {
    id: CLIENT_ID,
    title: CLIENT,
  },
  {
    id: STAFF_REVIEWER_ID,
    title: STAFF_REVIEWER,
  },
  {
    id: STAFF_DESIGNER_ID,
    title: STAFF_DESIGNER,
  },
];


export const FORM_ACCESS =[{
  type: "read_all",
  roles:  [CLIENT_ID,
    STAFF_REVIEWER_ID,
    STAFF_DESIGNER_ID
      ]
  }]

export const OPERATIONS = {
  insert: {
    action: "insert",
    buttonType: "primary",
    icon: "pencil",
    permissionsResolver: function permissionsResolver() {
      return true;
    },
    title: <Translation>{(t)=>t(""Submit New"")}</Translation>,
  },
  submission: {
    action: "submission",
    buttonType: "primary",
    icon: "list-alt",
    permissionsResolver: function permissionsResolver() {
      return true;
    },

    title: <Translation>{(t)=>t(""View Submissions"")}</Translation>,
  },
  edit: {
    action: "edit",
    buttonType: "primary",
    icon: "edit",
    permissionsResolver: function permissionsResolver() {
      return true;
    },

    title: <Translation>{(t)=>t(""Edit Form"")}</Translation>,
  },
  viewForm: {
    action: "viewForm",
    buttonType: "primary",
    icon: "eye",
    permissionsResolver: function permissionsResolver() {
      return true;
    },

    title: <Translation>{(t)=>t(""View/Edit Form"")}</Translation>,
  },
  delete: {
    action: "delete",
    buttonType: "primary",
    icon: "trash",
    permissionsResolver: function permissionsResolver() {
      return true;
    },
    title: <Translation>{(t)=>t(""Delete Form"")}</Translation>,
  },
  view: {
    action: "viewSubmission",
    buttonType: "primary",
    icon: "list",
    permissionsResolver: function permissionsResolver() {
      return true;
    },

    title: <Translation>{(t)=>t("View")}</Translation>,
  },
  editSubmission: {
    action: "edit",
    buttonType: "primary",
    icon: "edit",
    permissionsResolver: function permissionsResolver() {
      return true;
    },

    title: <Translation>{(t)=>t("Edit")}</Translation>,
  },
  deleteSubmission: {
    action: "delete",
    buttonType: "primary",
    icon: "trash",
    permissionsResolver: function permissionsResolver() {
      return true;
    },
    title: <Translation>{(t)=>t("Delete")}</Translation>,
  },
};

export const SUBMISSION_ACCESS = [
  {
    roles: [STAFF_DESIGNER_ID],
    type: "create_all",
  },
  {
    roles: [STAFF_REVIEWER_ID],
    type: "read_all",
  },
  {
    roles: [STAFF_REVIEWER_ID],
    type: "update_all",
  },
  {
    roles: [STAFF_DESIGNER_ID, STAFF_REVIEWER_ID],
    type: "delete_all",
  },
  {
    roles:[CLIENT_ID],
    type:"create_own"
  },
  // {
  //   roles: [CLIENT_ID],
  //   type: "create_own",
  // },
  {
    roles: [CLIENT_ID,],
    type: "read_own",
  },
  {
    roles: [CLIENT_ID],
    type: "update_own",
  },
  {
    roles: [STAFF_REVIEWER_ID],
    type: "delete_own",
  },
];

