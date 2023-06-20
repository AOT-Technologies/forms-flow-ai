import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  publish: undefined,
  subscribe: undefined,
};

const PubSubReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CONSTANTS.SET_PUB_SUB_INSTANCE:
      return {
        ...state,
        publish: action.payload.publish,
        subscribe: action.payload.subscribe,
      };

    default:
      return state;
  }
};
export default PubSubReducer;
