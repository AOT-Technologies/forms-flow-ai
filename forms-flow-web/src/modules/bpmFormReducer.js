import ACTION_CONSTANTS from "../actions/actionConstants";
import {formatForms, getPaginatedForms} from "../apiManager/services/bpmServices";

const initialState = {
  error: '',
  formsFullList:[],
  forms: [],
  isActive: false,
  limit:10,
  pagination: {
  numPages: 0,
    page: 1,
    total: 0,
  },
  query:{},
  select:'',
  sort:'',
  totalForms:"",
  maintainPagination:false
};

const bpmForms = (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.BPM_FORM_LIST:
      return {...state, forms: getPaginatedForms(formatForms(action.payload),state.limit, state.maintainPagination? state.pagination.page:1, state.sort), formsFullList:formatForms(action.payload), isActive: false,  totalForms:action.payload.length,  pagination: {
          numPages: Math.ceil(action.payload.length/ state.limit),
          page: state.maintainPagination? state.pagination.page:1,
          total: action.payload.length,
        }};
    case ACTION_CONSTANTS.IS_BPM_FORM_LIST_LOADING:
      return {...state, isActive: action.payload};
    case ACTION_CONSTANTS.BPM_FORM_LIST_PAGE_CHANGE:
      return {...state, pagination: {...state.pagination,...{
          page: action.payload}},forms:getPaginatedForms(state.formsFullList,state.limit,action.payload, state.sort)};
    case ACTION_CONSTANTS.BPM_FORM_LIST_LIMIT_CHANGE:
      return {...state, limit:action.payload, pagination: {
          numPages: Math.ceil(state.totalForms/ action.payload),
          page: 1,
          total: state.totalForms,
        }, forms:getPaginatedForms(state.formsFullList,action.payload,1, state.sort)}
    case ACTION_CONSTANTS.BPM_FORM_LIST_SORT_CHANGE:
      return {...state, sort:action.payload,forms:getPaginatedForms(state.formsFullList,state.limit,state.pagination.page, action.payload)};
    case ACTION_CONSTANTS.BPM_MAINTAIN_PAGINATION:
      return {...state, maintainPagination: action.payload};
    default:
      return state;
  }
};
export default bpmForms;
