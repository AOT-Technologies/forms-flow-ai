import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  isDashboardLoading:true,
  dashboardsList:[],
  dashboardDetail: {}
}

export default (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.IS_DASHBOARD_LOADING:
      return {...state, isLoading: action.payload};
    case ACTION_CONSTANTS.LIST_DASHBOARDS:
      return {...state, dashboardsList: action.payload};
    case ACTION_CONSTANTS.DASHBOARD_DETAIL:
      return {...state, dashboardDetail: action.payload};
    default:
      return state;
  }
}
