import * as types from './constants';

export function form(config) {
  const initialState = {
    id: '',
    isActive: false,
    lastUpdated: 0,
    form: {},
    url: '',
    error: '',
  };

  return (state = initialState, action) => {
    // Only proceed for this form.
    if (action.name !== config.name) {
      return state;
    }
    switch (action.type) {
      case types.FORM_CLEAR_ERROR:
        return {
          ...state,
          error: '',
        };
      case types.FORM_REQUEST:
        return {
          ...state,
          isActive: true,
          id: action.id,
          form: {},
          url: action.url,
          error: '',
        };
      case types.FORM_SUCCESS:
        return {
          ...state,
          isActive: false,
          id: action.form._id,
          form: action.form,
          url: action.url || state.url,
          error: '',
        };
      case types.FORM_FAILURE:
        return {
          ...state,
          isActive: false,
          isInvalid: true,
          error: action.error,
        };
      case types.FORM_SAVE:
        return {
          ...state,
          isActive: true,
        };
      case types.FORM_RESET:
        return initialState;
      default:
        return state;
    }
  };
}
