import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
   apiCallError:null
};

const ErrorHandling = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CONSTANTS.API_CALL_ERROR:
      return { ...state, apiCallError: action.payload };
    default:
      return state;
  }
};

export default ErrorHandling;
