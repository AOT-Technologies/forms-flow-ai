import * as type from './constants';

const initialState = {
  init: false,
  isActive: false,
  user: null,
  authenticated: false,
  submissionAccess: {},
  formAccess: {},
  projectAccess: {},
  roles: {},
  is: {},
  error: '',
};

function mapProjectRolesToUserRoles(projectRoles, userRoles) {
  return Object.entries(projectRoles).reduce((result, [name, role]) => ({
    ...result,
    [name]: userRoles.includes(role._id),
  }), {});
}

function getUserRoles(projectRoles) {
  return Object.keys(projectRoles).reduce((result, name) => ({
    ...result,
    [name]: name === 'anonymous',
  }), {});
}

export const auth = config => (state = initialState, action) => {
  switch (action.type) {
    case type.USER_REQUEST:
      return {
        ...state,
        init: true,
        submissionAccess: false,
        isActive: true
      };
    case type.USER_REQUEST_SUCCESS:
      return {
        ...state,
        isActive: false,
        user: action.user,
        authenticated: true,
        is: mapProjectRolesToUserRoles(state.roles, action.user.roles),
        error: '',
      };
    case type.USER_REQUEST_FAILURE:
      return {
        ...state,
        isActive: false,
        is: getUserRoles(state.roles),
        error: action.error,
      };
    case type.USER_LOGOUT:
      return {
        ...state,
        user: null,
        isActive: false,
        authenticated: false,
        is: getUserRoles(state.roles),
        error: '',
      };
    case type.USER_SUBMISSION_ACCESS:
      return {
        ...state,
        submissionAccess: action.submissionAccess,
      };
    case type.USER_FORM_ACCESS:
      return {
        ...state,
        formAccess: action.formAccess,
      };
    case type.USER_PROJECT_ACCESS:
      return {
        ...state,
        projectAccess: action.projectAccess,
      };
    case type.USER_ROLES:
      return {
        ...state,
        roles: action.roles,
      };
    default:
      return state;
  }
};
