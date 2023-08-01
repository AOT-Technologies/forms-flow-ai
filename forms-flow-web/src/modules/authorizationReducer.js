import ACTION_CONSTANTS from "../actions/actionConstants";

// reducers.js
export const initialState = {
  roles: [],
  userError: null,
  userGroups:[],
  designerGroups:[],
  clientGroups:[],
};

const userAuthorization = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CONSTANTS.SET_USER_GROUPS:
      return { ...state, userGroups: action.payload };
    case ACTION_CONSTANTS.SET_DESIGNER_GROUPS:
      return { ...state, designerGroups: action.payload };
    case ACTION_CONSTANTS.SET_CLIENT_GROUPS:
      return { ...state, clientGroups: action.payload };    
    default:
      return state;
  }
};
export default userAuthorization;