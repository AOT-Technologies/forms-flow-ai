 /* istanbul ignore file */
import ACTION_CONSTANTS from "./actionConstants"

//updates the dashboards state 
export const setDashboards = (data)=>dispatch=>{
    dispatch({
      type:ACTION_CONSTANTS.DASHBOARDS_LIST,
      payload:data
    })
  }
// handles the error cases
  export const dashboardErrorHandler = (data) => dispatch=>{
      dispatch({
          type:ACTION_CONSTANTS.DASHBOARDS_LIST_ERROR,
          payload:data
      })
  }

// updates the groups state 
export const setGroups = (data)=>dispatch=>{
  dispatch({
    type:ACTION_CONSTANTS.DASHBOARDS_LIST_GROUPS,
    payload:data
  })
}


export const updateErrorHandler = (data)=>dispatch=>{
  dispatch({
    type:ACTION_CONSTANTS.DASHBOARDS_UPDATE_ERROR,
    payload:data
  })
}


export const initiateUpdate = ()=>dispatch=>{
  dispatch({
    type:ACTION_CONSTANTS.DASHBOARDS_INITIATE_UPDATE,
    payload:null
  })
}

// maps the dashboards with the groups and update the state

export const updateDashboardFromGroups = (data)=>dispatch=>{
  dispatch({
    type:ACTION_CONSTANTS.DASHBOARDS_MAP_FROM_GROUPS,
    payload:{
      dashboards:data.dashboards,
      groups:data.groups
    }
  })
}

export const hideUpdateError = ()=>dispatch=>{
  dispatch({
    type:ACTION_CONSTANTS.DASHBOARDS_HIDE_UPDATE_ERROR,
    payload:null
  })
}

