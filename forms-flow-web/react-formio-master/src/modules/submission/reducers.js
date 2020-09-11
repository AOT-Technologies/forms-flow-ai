import * as types from './constants';

export function submission(config) {
  const initialState = {
    formId: '',
    id: '',
    isActive: false,
    lastUpdated: 0,
    submission: {},
    url: '',
    error: '',
  };

  return (state = initialState, action) => {
    // Only proceed for this form.
    if (action.name !== config.name) {
      return state;
    }
    switch (action.type) {
      case types.SUBMISSION_CLEAR_ERROR:
        return {
          ...state,
          error: '',
        };
      case types.SUBMISSION_REQUEST:
        return {
          ...state,
          formId: action.formId,
          id: action.id,
          url: action.url,
          submission: {},
          isActive: true,
        };
      case types.SUBMISSION_SAVE:
        return {
          ...state,
          formId: action.formId,
          id: action.id,
          url: action.url || state.url,
          submission: {},
          isActive: true,
        };
      case types.SUBMISSION_SUCCESS:
        return {
          ...state,
          id: action.submission._id,
          submission: action.submission,
          isActive: false,
          error: '',
        };
      case types.SUBMISSION_FAILURE:
        return {
          ...state,
          isActive: false,
          isInvalid: true,
          error: action.error,
        };
      case types.SUBMISSION_RESET:
        return initialState;
      default:
        return state;
    }
  };
}
