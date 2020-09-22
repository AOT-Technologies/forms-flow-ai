import Keycloak from "keycloak-js";

export const CLIENT =
  (window._env_ && window._env_.REACT_APP_CLIENT_ROLE) || process.env.REACT_APP_CLIENT_ROLE;
export const STAFF_DESIGNER =
  (window._env_ && window._env_.REACT_APP_STAFF_DESIGNER_ROLE) ||
  process.env?.REACT_APP_STAFF_DESIGNER_ROLE;
export const STAFF_REVIEWER =
  (window._env_ && window._env_.REACT_APP_STAFF_REVIEWER_ROLE) ||
  process.env.REACT_APP_STAFF_REVIEWER_ROLE;
export const ANONYMOUS_USER = "anonymous";

export const USER_RESOURCE_FORM_ID =
  (window._env_ && window._env_.REACT_APP_USER_RESOURCE_FORM_ID) ||
  process.env.REACT_APP_USER_RESOURCE_FORM_ID;
export const Keycloak_Client =
  (window._env_ && window._env_.REACT_APP_KEYCLOAK_CLIENT) ||
  process.env.REACT_APP_KEYCLOAK_CLIENT ||
  "forms-flow-web";
export const _kc = new Keycloak("/config/kc/keycloak.json");

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

export const OPERATIONS = {
  insert: {
    action: "insert",
    buttonType: "primary",
    icon: "pencil",
    permissionsResolver: function permissionsResolver() {
      return true;
    },
    title: "Submit New",
  },
  submission: {
    action: "submission",
    buttonType: "primary",
    icon: "list-alt",
    permissionsResolver: function permissionsResolver() {
      return true;
    },

    title: "View Submissions",
  },
  edit: {
    action: "edit",
    buttonType: "primary",
    icon: "edit",
    permissionsResolver: function permissionsResolver() {
      return true;
    },

    title: "Edit Form",
  },
  viewForm: {
    action: "viewForm",
    buttonType: "primary",
    icon: "eye",
    permissionsResolver: function permissionsResolver() {
      return true;
    },

    title: "View/Edit Form",
  },
  delete: {
    action: "delete",
    buttonType: "primary",
    icon: "trash",
    permissionsResolver: function permissionsResolver() {
      return true;
    },
    title: "Delete Form",
  },
  view: {
    action: "viewSubmission",
    buttonType: "primary",
    icon: "list",
    permissionsResolver: function permissionsResolver() {
      return true;
    },

    title: "View",
  },
  editSubmission: {
    action: "edit",
    buttonType: "primary",
    icon: "edit",
    permissionsResolver: function permissionsResolver() {
      return true;
    },

    title: "Edit",
  },
  deleteSubmission: {
    action: "delete",
    buttonType: "primary",
    icon: "trash",
    permissionsResolver: function permissionsResolver() {
      return true;
    },
    title: "Delete",
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
  // {
  //   roles:[CLIENT_ID, ANONYMOUS_ID],
  //   type:"create_own"
  // },
  {
    roles: [CLIENT_ID],
    type: "create_own",
  },
  {
    roles: [CLIENT_ID],
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
