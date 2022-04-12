import ACTION_CONSTANTS from "../actions/actionConstants";
import {formatForms, getPaginatedForms,getSearchResults} from "../apiManager/services/bpmServices";

const initialState = {
  error: '',
  formSearchList:[],
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
  sort:'title',
  totalForms:"",
  maintainPagination:false,
  searchText:'',
  bpmFormLoading:false
};

const bpmForms = (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.BPM_FORM_LIST:
      return {...state, forms: getPaginatedForms(formatForms(action.payload.forms),state.limit, state.maintainPagination? state.pagination.page:1, state.sort), formsFullList:formatForms(action.payload.forms), isActive: false,  totalForms:action.payload.length,  pagination: {
          numPages: Math.ceil(action.payload.forms.length/ state.limit),
          page: state.maintainPagination? state.pagination.page:1,
          total: action.payload.totalCount,
        }};
    case ACTION_CONSTANTS.IS_BPM_FORM_LIST_LOADING:
      return {...state, isActive: action.payload};
    case ACTION_CONSTANTS.BPM_FORM_LIST_PAGE_CHANGE:
      return {...state, pagination: {...state.pagination,...{
          page: action.payload}},forms:state.searchText?getPaginatedForms(state.formSearchList,state.limit,action.payload, state.sort): getPaginatedForms(state.formsFullList,state.limit,action.payload, state.sort)};
    case ACTION_CONSTANTS.BPM_FORM_LIST_LIMIT_CHANGE:
      const totalFormsLength = state.searchText? state.formSearchList.length : state.formsFullList.length
      return {...state, limit:action.payload, pagination: {
          numPages: Math.ceil(totalFormsLength/ action.payload),
          page: 1,
          total: totalFormsLength,
        }, forms:state.searchText?getPaginatedForms(state.formSearchList,action.payload,1, state.sort):getPaginatedForms(state.formsFullList,action.payload,1, state.sort)}
    case ACTION_CONSTANTS.BPM_FORM_LIST_SORT_CHANGE:
      return {...state, sort:action.payload,forms:state.searchText?getPaginatedForms(state.formSearchList,state.limit,state.maintainPagination?state.page:1,action.payload):getPaginatedForms(state.formsFullList,state.limit,state.maintainPagination? state.pagination.page:1, action.payload),pagination:{...state.pagination,page:1}};
    case ACTION_CONSTANTS.BPM_MAINTAIN_PAGINATION:
      return {...state, maintainPagination: action.payload};
    case ACTION_CONSTANTS.BPM_FORM_SEARCH:
      const searchResult = getSearchResults(state.formsFullList,action.payload)
      return {...state,searchText:action.payload,forms:getPaginatedForms(searchResult,state.limit, state.maintainPagination? state.pagination.page:1,state.sort, action.payload),formSearchList:searchResult,isActive:false,totalForms:searchResult.length, pagination: {
          numPages: Math.ceil(searchResult.length/ state.limit),
          page: 1,
          total:searchResult.length,
        },formsFullList:state.formsFullList};
    case ACTION_CONSTANTS.BPM_FORM_LOADING:
      return {...state, bpmFormLoading:action.payload};

    default:
      return state;
  }
};
export default bpmForms;
