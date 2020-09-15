import Formiojs from 'formiojs/Formio';
import * as types from './constants';
import {selectForm} from './selectors';

export const clearFormError = (name) => ({
  type: types.FORM_CLEAR_ERROR,
  name,
});

const requestForm = (name, id, url) => ({
  type: types.FORM_REQUEST,
  name,
  id,
  url,
});

const receiveForm = (name, form, url) => ({
  type: types.FORM_SUCCESS,
  form,
  name,
  url,
});

const failForm = (name, err) => ({
  type: types.FORM_FAILURE,
  error: err,
  name,
});

export const resetForm = (name) => ({
  type: types.FORM_RESET,
  name,
});

const sendForm = (name, form) => ({
  type: types.FORM_SAVE,
  form,
  name,
});

export const getForm = (name, id = '', done = () => {}) => {
  return (dispatch, getState) => {
    // Check to see if the form is already loaded.
    const form = selectForm(name, getState());
    if (form.components && Array.isArray(form.components) && form.components.length && form._id === id) {
      return;
    }

    const path = `${Formiojs.getProjectUrl()}/${id ? `form/${id}` : name}`;
    const formio = new Formiojs(path);

    dispatch(requestForm(name, id, path));

    return formio.loadForm()
      .then((result) => {
        dispatch(receiveForm(name, result));
        done(null, result);
      })
      .catch((result) => {
        dispatch(failForm(name, result));
        done(result);
      });
  };
};

export const saveForm = (name, form, done = () => {}) => {
  return (dispatch) => {
    dispatch(sendForm(name, form));

    const id = form._id;
    const path = `${Formiojs.getProjectUrl()}/form${id ? `/${id}` : ''}`;
    const formio = new Formiojs(path);

    formio.saveForm(form)
      .then((result) => {
        const url = `${Formiojs.getProjectUrl()}/form/${result._id}`;
        dispatch(receiveForm(name, result, url));
        done(null, result);
      })
      .catch((result) => {
        dispatch(failForm(name, result));
        done(result);
      });
  };
};

export const deleteForm = (name, id, done = () => {}) => {
  return (dispatch) => {
    const path = `${Formiojs.getProjectUrl()}/form/${id}`;
    const formio = new Formiojs(path);

    return formio.deleteForm()
      .then(() => {
        dispatch(resetForm(name));
        done();
      })
      .catch((result) => {
        dispatch(failForm(name, result));
        done(result);
      });
  };
};
