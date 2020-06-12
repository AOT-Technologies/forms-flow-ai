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
