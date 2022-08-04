import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  draftSubmission: {},
  draftList: [],
  countPerPage: 5,
  isDraftListLoading: true,
  draftCount: null,
  activePage: 1,
  isDraftDetailLoading: true,
  submission: {},
};

const draftSubmission = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CONSTANTS.SAVE_DRAFT_DATA:
      return { ...state, draftSubmission: action.payload };
    case ACTION_CONSTANTS.DRAFT_LIST:
      return { ...state, draftList: action.payload, isDraftListLoading: false };
    case ACTION_CONSTANTS.DRAFT_DETAIL:
      return {
        ...state,
        submission: action.payload,
        isDraftDetailLoading: false,
      };
    default:
      return state;
  }
};

export default draftSubmission;
