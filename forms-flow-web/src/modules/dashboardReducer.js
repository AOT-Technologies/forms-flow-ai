import ACTION_CONSTANTS from "../actions/actionConstants";

export const initialState = {
  dashboards: [],
  isloading: true,
  iserror: false,
  groups: [],
  isDashUpdated: false,
  isGroupUpdated: false,
  updateError: false,
  authorizations: [],
  authDashBoards: [],
  isAuthUpdated: false,
  isAuthRecieved: false,
  authorization_error: null,
};

const dashboards = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CONSTANTS.DASHBOARDS_LIST: {
      let dashboards = action.payload.results.map((result) => ({
        id: result.id,
        name: result.name,
      }));
      return { ...state, dashboards: dashboards, isDashUpdated: true };
    }
    case ACTION_CONSTANTS.DASHBOARDS_LIST_ERROR:
      return { ...state, iserror: true, error: action.payload };

    case ACTION_CONSTANTS.DASHBOARDS_LIST_GROUPS:
      return {
        ...state,
        groups: action.payload,
        isGroupUpdated: true,
        updateError: false,
      };

    case ACTION_CONSTANTS.DASHBOARDS_UPDATE_ERROR:
      return {
        ...state,
        updateError: true,
        error: action.payload,
        isloading: false,
      };

    case ACTION_CONSTANTS.SET_AUTHORIZATIONS:
      return {
        ...state,
        authorizations: action.payload,
        isAuthRecieved: true,
        isAuthUpdated: false,
      };
    case ACTION_CONSTANTS.UPDATE_AUTHORIZATIONS:
      return {
        ...state,
        authDashBoards: action.payload,
        isAuthUpdated: true,
        isloading: false,
      };
    default:
      return state;
  }
};

export default dashboards;
