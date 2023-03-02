import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
 selectedForms: [],
 rules: [],
 bundleData:{},
 bundleForms :{
  error: "",
  forms: [],
  isActive: false,
  limit: 5,
  page: 1,
  totalForms: 0,
  bundleFormLoading: false,
  sortBy: "formName",
  sortOrder: "asc",
  formType:"",
  searchText: "",
 },
 workflowAssociated:null
};

const bundle = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_CONSTANTS.BUNDLE_SELECTED_FORMS:
        return { ...state, selectedForms: action.payload };
    case ACTION_CONSTANTS.BUNDLE_RULES:
        return { ...state, rules: action.payload };
    case ACTION_CONSTANTS.BUNDLE_FORM_LIST:
      return {...state, bundleForms:{...state.bundleForms, forms: action.payload.forms, 
        totalForms:action.payload.totalCount}};
    case ACTION_CONSTANTS.BUNDLE_FORM_LIST_LOADING:
      return {...state, bundleForms:{...state.bundleForms, bundleFormLoading: action.payload}};
    case ACTION_CONSTANTS.BUNDLE_FORM_LIST_PAGE_CHANGE:
      return {...state, bundleForms:{...state.bundleForms, page: action.payload}};
    case ACTION_CONSTANTS.BUNDLE_FORM__LIST_FORM_SEARCH:
      return {...state, bundleForms:{...state.bundleForms, searchText: action.payload}};
    case ACTION_CONSTANTS.BUNDLE_SAVED_DATA:
        return {...state, bundleData:action.payload};
    case ACTION_CONSTANTS.BUNDLE_WORKFLOW_SET:
        return {...state, workflowAssociated:action.payload};
    case ACTION_CONSTANTS.BUNDLE_RESET:
      return {...initialState};
      

    default:
      return state;
  }
};

export default bundle;
