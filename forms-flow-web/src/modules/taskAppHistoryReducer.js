import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  appHistory:[],
  isHistoryListLoading: true
}


const taskAppHistory = (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.IS_HISTORY_LOADING:
      return {...state, isHistoryListLoading: action.payload};
    case ACTION_CONSTANTS.LIST_APPLICATION_HISTORY:
      return {...state, appHistory: action.payload};
    default:
      return state;
  }
}

export default taskAppHistory ;
