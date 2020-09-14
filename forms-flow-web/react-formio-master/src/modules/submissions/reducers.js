import _pick from 'lodash/pick';

import * as types from './constants';

export function submissions({
  name,
  limit = 10,
  query = {},
  select = '',
  sort = '',
}) {
  const initialState = {
    error: '',
    formId: '',
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
    submissions: [],
  };

  return (state = initialState, action) => {
    // Only proceed for this submissions.
    if (action.name !== name) {
      return state;
    }

    switch (action.type) {
      case types.SUBMISSIONS_RESET:
        return initialState;
      case types.SUBMISSIONS_REQUEST:
        return {
          ...state,
          ..._pick(action.params, [
            'limit',
            'query',
            'select',
            'sort',
          ]),
          error: '',
          formId: action.formId,
          isActive: true,
          pagination: {
            ...state.pagination,
            page: action.page,
          },
          submissions: [],
        };
      case types.SUBMISSIONS_SUCCESS: {
        const total = action.submissions.serverCount;

        return {
          ...state,
          isActive: false,
          pagination: {
            ...state.pagination,
            numPages: Math.ceil(total / state.limit),
            total,
          },
          submissions: action.submissions,
        };
      }
      case types.SUBMISSIONS_FAILURE:
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
