import Keycloak from "keycloak-js";

export const CLIENT = process.env.REACT_APP_CLIENT_ROLE;
export const STAFF_DESIGNER = process.env.REACT_APP_STAFF_DESIGNER_ROLE;
export const STAFF_REVIEWER = process.env.REACT_APP_STAFF_REVIEWER_ROLE;
export const USER_RESOURCE_FORM_ID = process.env.REACT_APP_USER_RESOURCE_FORM_ID;
export const Keycloak_Client = process.env.REACT_APP_KEYCLOAK_CLIENT || 'forms-flow-web';
export const  _kc = new Keycloak(process.env.REACT_APP_KEYCLOAK_JSON ||'/keycloak.json');

export const ROLES = [{
    id: process.env.REACT_APP_CLIENT_ID,
    title: CLIENT
  },
  {
    id: process.env.REACT_APP_STAFF_REVIEWER_ID,
    title: STAFF_REVIEWER
  }, {
    id: process.env.REACT_APP_STAFF_DESIGNER_ID,
    title: STAFF_DESIGNER
  }
];

export const OPERATIONS = {
  insert: {
    action: 'insert',
    buttonType: 'primary',
    icon: 'pencil',
    permissionsResolver: function permissionsResolver() {
      return true;
    },
    title: 'Submit New'
  },
  submission: {
    action: 'submission',
    buttonType: 'warning',
    icon: 'list-alt',
    permissionsResolver: function permissionsResolver() {
      return true;
    },

    title: 'View Submissions'
  },
  edit: {
    action: 'edit',
    buttonType: 'secondary',
    icon: 'edit',
    permissionsResolver: function permissionsResolver() {
      return true;
    },

    title: 'Edit Form'
  },
  viewForm: {
    action: 'viewForm',
    buttonType: 'warning',
    icon: 'eye',
    permissionsResolver: function permissionsResolver() {
      return true;
    },

    title: 'View Form'
  },
  delete: {
    action: 'delete',
    buttonType: 'danger',
    icon: 'trash',
    permissionsResolver: function permissionsResolver() {
      return true;
    },
    title: 'Delete Form'
  },
  view: {
    action: 'viewSubmission',
    buttonType: 'warning',
    icon: 'list',
    permissionsResolver: function permissionsResolver() {
      return true;
    },

    title: 'View'
  },
  editSubmission: {
    action: 'edit',
    buttonType: 'secondary',
    icon: 'edit',
    permissionsResolver: function permissionsResolver() {
      return true;
    },

    title: 'Edit'
  },
  deleteSubmission: {
    action: 'delete',
    buttonType: 'danger',
    icon: 'trash',
    permissionsResolver: function permissionsResolver() {
      return true;
    },
  }
};

export const SUBMISSION_ACCESS = [
  {
    roles:[process.env.REACT_APP_STAFF_DESIGNER_ID],
    type:"create_all"
  },
  {
    roles:[process.env.REACT_APP_STAFF_REVIEWER_ID],
    type:"read_all"
  },
  {
    roles:[process.env.REACT_APP_STAFF_REVIEWER_ID],
    type:"update_all"
  },
  {
    roles:[process.env.REACT_APP_STAFF_DESIGNER_ID,process.env.REACT_APP_STAFF_REVIEWER_ID],
    type:"delete_all"
  },
  {
    roles:[process.env.REACT_APP_CLIENT_ID],
    type:"create_own"
  },
  {
    roles:[process.env.REACT_APP_CLIENT_ID],
    type:"read_own"
  },
  {
    roles:[process.env.REACT_APP_CLIENT_ID],
    type:"update_own"
  },
  {
    roles:[process.env.REACT_APP_STAFF_REVIEWER_ID],
    type:"delete_own"
  },
];
