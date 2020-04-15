import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  bearerToken: '',
  roles: ''
}

export default (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.SET_USER_TOKEN:
      return {...state, token: action.payload};
    case ACTION_CONSTANTS.SET_USER_ROLES:
      return {...state, roles: action.payload}
    default:
      return state;
  }
}
