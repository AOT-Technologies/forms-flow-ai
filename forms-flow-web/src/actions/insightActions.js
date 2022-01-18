 /* istanbul ignore file */
import ACTION_CONSTANTS from './actionConstants';

export const getDashboards = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.LIST_DASHBOARDS,
    payload:data
  })
}

export const getDashboardDetail = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.DASHBOARD_DETAIL,
    payload:data
  })
}

export const setInsightDetailLoader = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_INSIGHT_DETAIL_LOADING,
    payload:data
  })
}

export const setInsightDashboardListLoader = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_DASHBOARD_LOADING,
    payload:data
  })
}
