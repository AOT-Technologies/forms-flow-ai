import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  isMenuOpen: false
}

export default (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.TOGGLE_MENU:
      return {...state, isMenuOpen: action.payload};
    default:
      return state;
  }
}
