import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  isMenuOpen: false
}

const menu= (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.TOGGLE_MENU:
      return {...state, isMenuOpen: action.payload};
    default:
      return state;
  }
}

export default menu;
