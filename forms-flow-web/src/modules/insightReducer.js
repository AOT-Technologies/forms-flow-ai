import ACTION_CONSTANTS from "../actions/actionConstants";

const initialState = {
  isDashboardLoading:true,
  dashboardsList:[],
  dashboardDetail: {},
  isInsightLoading:true,
}

const insights = (state = initialState, action)=> {
  switch (action.type) {
    case ACTION_CONSTANTS.IS_DASHBOARD_LOADING:
      return {...state, isDashboardLoading: action.payload};
    case ACTION_CONSTANTS.LIST_DASHBOARDS:
      return {...state, dashboardsList: action.payload, isDashboardLoading: false, isInsightLoading: false};
    case ACTION_CONSTANTS.DASHBOARD_DETAIL:
      return {...state, dashboardDetail: action.payload, isInsightLoading: false};
    case ACTION_CONSTANTS.IS_INSIGHT_DETAIL_LOADING:
      return {...state, isInsightLoading: action.payload};
    default:
      return state;
  }
}

export default insights;
