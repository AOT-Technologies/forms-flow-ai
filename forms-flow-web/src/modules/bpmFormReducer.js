import ACTION_CONSTANTS from "../actions/actionConstants";
import { formatForms } from "../apiManager/services/bpmServices";

const initialState = {
  error: "",
  forms: [],
  isActive: false,
  limit: 5,
  page: 1,
  totalForms: 0,
  bpmFormLoading: false,
  sortBy: "formName",
  sortOrder: "asc",
  formType:"form",
  searchText: "",
  sort: {
    activeKey: "formName", 
    formName: { sortOrder: "asc" },
    modified: { sortOrder: "asc" },
    submissionCount: { sortOrder: "asc" },
    visibility: { sortOrder: "asc"},
    status: { sortOrder: "asc" },
  },
  clientFormSearch:"",
};

const bpmForms = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CONSTANTS.BPM_FORM_LIST:
      return {
        ...state,
        forms: formatForms(action.payload.forms),
        totalForms: action.payload.totalCount,
      };
    case ACTION_CONSTANTS.BPM_FORM_LIST_LIMIT_CHANGE:
      return { ...state, limit: action.payload };
    case ACTION_CONSTANTS.BPM_FORM_LIST_PAGE_CHANGE:
      return { ...state, page: action.payload };
    case ACTION_CONSTANTS.IS_BPM_FORM_LIST_LOADING:
      return { ...state, isActive: action.payload };
    case ACTION_CONSTANTS.BPM_FORM_SEARCH:
      return { ...state, searchText: action.payload };
    case ACTION_CONSTANTS.BPM_FORM_LIST_SORT_CHANGE:
      return { ...state, sortOrder: action.payload };
    case ACTION_CONSTANTS.BPM_FORM_LOADING:
      return { ...state, bpmFormLoading: action.payload };
    case ACTION_CONSTANTS.BPM_FORM_TYPE:
      return { ...state, formType: action.payload };
    case ACTION_CONSTANTS.BPM_FORM_SORT:
      return { ...state, sort: action.payload };
    case ACTION_CONSTANTS.BPM_CLIENT_FORM_SEARCH:
      return { ...state, clientFormSearch: action.payload };
    default:
      return state;
  }
};
export default bpmForms;
