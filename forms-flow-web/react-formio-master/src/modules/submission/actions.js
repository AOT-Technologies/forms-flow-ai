import Formiojs from 'formiojs/Formio';

import * as types from './constants';

export const clearSubmissionError = (name) => ({
  type: types.SUBMISSION_CLEAR_ERROR,
  name,
});

const requestSubmission = (name, id, formId,  url) => ({
  type: types.SUBMISSION_REQUEST,
  name,
  id,
  formId,
  url,
});

const sendSubmission = (name, data) => ({
  type: types.SUBMISSION_SAVE,
  name,
});

const receiveSubmission = (name, submission, url) => ({
  type: types.SUBMISSION_SUCCESS,
  name,
  submission,
  url,
});

const failSubmission = (name, error) => ({
  type: types.SUBMISSION_FAILURE,
  name,
  error,
});

export const resetSubmission = (name) => ({
  type: types.SUBMISSION_RESET,
  name,
});

export const getSubmission = (name, id, formId, done = () => {}) => (dispatch, getState) => {
  // Check to see if the submission is already loaded.
  if (getState().id === id) {
    return;
  }

  const url = `${Formiojs.getProjectUrl()}/${formId ? `form/${formId}` : name}/submission/${id}`;
  const formio = new Formiojs(url);

  dispatch(requestSubmission(name, id, formId, url));

  formio.loadSubmission()
    .then((result) => {
      dispatch(receiveSubmission(name, result));
      done(null, result);
    })
    .catch((error) => {
      dispatch(failSubmission(name, error));
      done(error);
    });
};

export const saveSubmission = (name, data, formId, done = () => {}) => (dispatch) => {
  dispatch(sendSubmission(name, data));

  const id = data._id;

  const formio = new Formiojs(`${Formiojs.getProjectUrl()}/${formId ? `form/${formId}` : name}/submission${id ? `/${id}` : ''}`);

  formio.saveSubmission(data)
    .then((result) => {
      const url = `${Formiojs.getProjectUrl()}/${formId ? `form/${formId}` : name}/submission/${result._id}`;
      dispatch(receiveSubmission(name, result, url));
      done(null, result);
    })
    .catch((error) => {
      dispatch(failSubmission(name, error));
      done(error);
    });
};

export const deleteSubmission = (name, id, formId, done = () => {}) => (dispatch, getState) => {
  const formio = new Formiojs(`${Formiojs.getProjectUrl()}/${formId ? `form/${formId}` : name}/submission/${id}`);

  return formio.deleteSubmission()
    .then(() => {
      dispatch(resetSubmission(name));
      done(null, true);
    })
    .catch((error) => {
      dispatch(failSubmission(name, error));
      done(error);
    });
};
