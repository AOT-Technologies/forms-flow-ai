import Keycloak from "keycloak-js";
export const CLIENT = 'rpas-client';
export const STAFF_DESIGNER = 'rpas-formdesigner';
export const STAFF_REVIEWER = 'rpas-reviewer';
export const USER_RESOURCE_FORM_ID = process.env.REACT_APP_USER_RESOURCE_FORM_ID || '5e78bdd7a054f922bc82d065';
export const Keycloak_Client = process.env.REACT_APP_KEYCLOAK_CLIENT || 'forms-flow-web';
export const  _kc = new Keycloak(process.env.REACT_APP_KEYCLOAK_JSON ||'/keycloak.json');

//TODO UPDATE THIS TO FORMIO ROLE IDS
// console.log(process.env);
export const ROLES = [{
    id: process.env.REACT_APP_CLIENT_ID || '5e86d9f71563fb59d4232342',
    title: CLIENT
  },
  {
    id: process.env.REACT_APP_STAFF_REVIEWER_ID || '5e86d9f71563fb59d4232343',
    title: STAFF_REVIEWER
  }, {
    id: process.env.REACT_APP_STAFF_DESIGNER_ID || '5e86d8161563fb59d4232331',
    title: STAFF_DESIGNER
  } //administrator
];

export const OPERATIONS = {
  insert: {
    action: 'view',
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
    action: 'view',
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
    // title: 'Delete'
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
