import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
 selectedForms: [],
 rules: []
};

const bundle = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CONSTANTS.BUNDLE_SELECTED_FORMS:
        return { ...state, selectedForms: action.payload };
    case ACTION_CONSTANTS.BUNDLE_RULES:
        return { ...state, rules: action.payload };
    default:
      return state;
  }
};

export default bundle;
