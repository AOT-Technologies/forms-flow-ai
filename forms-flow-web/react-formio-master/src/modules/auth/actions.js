import formiojs from 'formiojs/Formio';
import * as type from './constants';

const requestUser = () => ({
  type: type.USER_REQUEST,
});

const receiveUser = (user) => ({
  type: type.USER_REQUEST_SUCCESS,
  user,
});

const failUser = (error) => ({
  type: type.USER_REQUEST_FAILURE,
  error,
});

const logoutUser = () => ({
  type: type.USER_LOGOUT,
});

const submissionAccessUser = (submissionAccess) => ({
  type: type.USER_SUBMISSION_ACCESS,
  submissionAccess,
});

const formAccessUser = (formAccess) => ({
  type: type.USER_FORM_ACCESS,
  formAccess,
});

const projectAccessUser = (projectAccess) => ({
  type: type.USER_PROJECT_ACCESS,
  projectAccess,
});

const rolesUser = (roles) => ({
  type: type.USER_ROLES,
  roles,
});

function transformSubmissionAccess(forms) {
  return Object.values(forms).reduce((result, form) => ({
    ...result,
    [form.name]: form.submissionAccess.reduce((formSubmissionAccess, access) => ({
      ...formSubmissionAccess,
      [access.type]: access.roles,
    }), {}),
  }), {});
}

function transformFormAccess(forms) {
  return Object.values(forms).reduce((result, form) => ({
    ...result,
    [form.name]: form.access.reduce((formAccess, access) => ({
      ...formAccess,
      [access.type]: access.roles,
    }), {}),
  }), {});
}

function transformProjectAccess(projectAccess) {
  return projectAccess.reduce((result, access) => ({
    ...result,
    [access.type]: access.roles,
  }), {});
}

export const initAuth = () => (dispatch) => {
  const projectUrl = formiojs.getProjectUrl();

  dispatch(requestUser());

  Promise.all([
    formiojs.currentUser(),
    formiojs.makeStaticRequest(`${projectUrl}/access`)
      .then((result) => {
        const submissionAccess = transformSubmissionAccess(result.forms);
        const formAccess = transformFormAccess(result.forms);

        dispatch(submissionAccessUser(submissionAccess));
        dispatch(formAccessUser(formAccess));
        dispatch(rolesUser(result.roles));
      })
      .catch(() => {}),
    formiojs.makeStaticRequest(projectUrl)
      .then((project) => {
        const projectAccess = transformProjectAccess(project.access);
        dispatch(projectAccessUser(projectAccess));
      })
      .catch(() => {}),
  ])
    .then(([user]) => {
      if (user) {
        dispatch(receiveUser(user));
      }
      else {
        dispatch(logoutUser());
      }
    })
    .catch((result) => {
      dispatch(failUser(result));
    });
};

export const setUser = (user) => (dispatch) => {
  formiojs.setUser(user);
  dispatch(receiveUser(user));
};

export const logout = () => (dispatch) => {
  formiojs.logout();
  dispatch(logoutUser());
};
