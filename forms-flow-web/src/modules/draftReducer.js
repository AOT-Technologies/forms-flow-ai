import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  draftSubmission: {},
  draftDelete : { modalOpen: false, draftId:null, draftName:'' },
  draftSubmissionError: {
    error: null,
    message: null,
  },
  draftList: [],
  countPerPage: 5,
  isDraftListLoading: true,
  draftCount: 0,
  activePage: 1,
  isDraftDetailLoading: true,
  submission: {},
  draftDetailStatusCode: "",
  lastUpdated: {},
  sortOrder : "desc",
  sortBy : "id",
  isDraftLoading : false,
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
        isDraftDetailLoading: action.payload?.isDraftDetailLoading || false,
      };
    case ACTION_CONSTANTS.DRAFT_COUNT:
      return { ...state, draftCount: action.payload };
    case ACTION_CONSTANTS.DRAFT_LIST_LOADER:
      return { ...state, isDraftListLoading: action.payload };
    case ACTION_CONSTANTS.SET_DRAFT_LIST_ACTIVE_PAGE:
      return { ...state, activePage: action.payload };
    case ACTION_CONSTANTS.SET_DRAFT_COUNT_PER_PAGE:
      return { ...state, countPerPage: action.payload };
    case ACTION_CONSTANTS.DRAFT_SUBMISSION_ERROR:
      return {
        ...state,
        draftSubmissionError: { error: true, message: action.payload },
      };
    case ACTION_CONSTANTS.DRAFT_DETAIL_STATUS_CODE:
      return { ...state, draftDetailStatusCode: action.payload };
    case ACTION_CONSTANTS.DRAFT_LAST_UPDATED:
      return { ...state, lastUpdated: action.payload };
    case ACTION_CONSTANTS.DRAFT_DELETE:
      return { ...state, draftDelete: action.payload };
    case ACTION_CONSTANTS.DRAFT_LIST_SORT_ORDER:
      return { ...state, sortOrder: action.payload };
    case ACTION_CONSTANTS.DRAFT_LIST_SORT_BY:
        return { ...state, sortBy: action.payload };
    case ACTION_CONSTANTS.DRAFT_LIST_LOADING:
        return { ...state, isDraftLoading : action.payload };
    default:
      return state;
  }
};

export default draftSubmission;
