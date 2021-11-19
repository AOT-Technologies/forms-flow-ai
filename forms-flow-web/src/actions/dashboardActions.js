import ACTION_CONSTANTS from "./actionConstants"

//updates the dashboards state 
export const setDashboards = (data)=>dispatch=>{
    dispatch({
      type:ACTION_CONSTANTS.GET_DASHBOARDS,
      payload:data
    })
  }
// handles the error cases
  export const dashboardErrorHandler = (data) => dispatch=>{
      dispatch({
          type:ACTION_CONSTANTS.DASHBOARDS_FETCH_ERROR,
          payload:data
      })
  }

// updates the groups state 
export const setGroups = (data)=>dispatch=>{
  dispatch({
    type:ACTION_CONSTANTS.FETCH_KEYCLOAK_GROUPES,
    payload:data
  })
}

// maps the dashboards with the groups and update the state
export const updateDashboardFromGroups = (data)=>dispatch=>{
  dispatch({
    type:ACTION_CONSTANTS.UPDATE_DASHBOARDS_FROM_GROUPS,
    payload:data
  })
}

export const updateErrorHandler = (data)=>dispatch=>{
  dispatch({
    type:ACTION_CONSTANTS.UPDATE_ERROR_HANDLE,
    payload:data
  })
}
