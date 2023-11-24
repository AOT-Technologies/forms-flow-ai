import ACTION_CONSTANTS from "../actions/actionConstants";

// reducers.js
export const initialState = {
  roles: [],
  userError: null,
  userGroups:[],
  clientGroups:[],
};

const userAuthorization = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CONSTANTS.SET_USER_GROUPS:
      return { ...state, userGroups: action.payload };
    case ACTION_CONSTANTS.SET_ROLES:
      return { ...state, roles: action.payload };
    case ACTION_CONSTANTS.SET_CLIENT_GROUPS:
      return { ...state, clientGroups: action.payload };    
    default:
      return state;
  }
};
export default userAuthorization;