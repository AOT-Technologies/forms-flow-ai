import _pick from 'lodash/pick';

import * as types from './constants';

export function forms({
  name,
  limit = 10,
  query = {},
  select = '',
  sort = '',
}) {
  const initialState = {
    error: '',
    forms: [],
    isActive: false,
    limit,
    pagination: {
      numPages: 0,
      page: 1,
      total: 0,
    },
    query,
    select,
    sort,
  };

  return (state = initialState, action) => {
    // Only proceed for this forms.
    if (action.name !== name) {
      return state;
    }

    switch (action.type) {
      case types.FORMS_RESET:
        return initialState;
      case types.FORMS_REQUEST:
        return {
          ...state,
          ..._pick(action.params, [
            'limit',
            'query',
            'select',
            'sort',
          ]),
          error: '',
          forms: [],
          isActive: true,
          pagination: {
            ...state.pagination,
            page: action.page,
          },
        };
      case types.FORMS_SUCCESS: {
        const total = action.forms.serverCount;

        return {
          ...state,
          forms: action.forms,
          isActive: false,
          pagination: {
            ...state.pagination,
            numPages: Math.ceil(total / state.limit),
            total,
          },
        };
      }
      case types.FORMS_FAILURE:
        return {
          ...state,
          error: action.error,
          isActive: false,
        };
      default:
        return state;
    }
  };
}
