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
    case ACTION_CONSTANTS.DRAFT_COUNT:
      return { ...state, draftCount: action.payload };
    case ACTION_CONSTANTS.DRAFT_LIST_LOADER:
      return { ...state, isDraftListLoading: action.payload };
    case ACTION_CONSTANTS.SET_DRAFT_LIST_ACTIVE_PAGE:
      return { ...state, activePage: action.payload };
    case ACTION_CONSTANTS.SET_DRAFT_COUNT_PER_PAGE:
      return { ...state, countPerPage: action.payload };
    default:
      return state;
  }
};

export default draftSubmission;
