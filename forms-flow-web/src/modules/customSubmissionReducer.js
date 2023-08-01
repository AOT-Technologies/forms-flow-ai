import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  submission:{}
};

const customSubmission = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CONSTANTS.CUSTOM_SUBMISSION:
      return { ...state, submission: action.payload };
    default:
      return state;
  }
};

export default customSubmission;
