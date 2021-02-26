import ACTION_CONSTANTS from './actionConstants'

export const setBPMTaskLoader = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_BPM_TASK_LOADING,
    payload:data
  })
}

export const setBPMTaskDetailLoader = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_BPM_TASK_DETAIL_LOADING,
    payload:data
  })
}

export const setBPMTaskDetailUpdating = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_BPM_TASK_DETAIL_UPDATING,
    payload:data
  })
}

export const setBPMTaskUpdateLoader = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_BPM_TASK_UPDATING,
    payload:data
  })
}

//TODO Update set to get on below cases

export const setBPMTaskList = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.BPM_LIST_TASKS,
    payload:data
  })
}


export const setBPMProcessList = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.BPM_PROCESS_LIST,
    payload:data
  })
}


export const setBPMUserList = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.BPM_USER_LIST,
    payload:data
  })
}



export const setBPMTaskCount = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.BPM_TASKS_COUNT,
    payload:data
  })
}
export const setBPMTaskDetail = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.BPM_TASK_DETAIL,
    payload:data
  })
}
export const setBPMFilterLoader = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_BPM_FILTERS_LOADING,
    payload:data
  })
}

export const setBPMFilterList = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.BPM_FITER_LIST,
    payload:data
  })
}

export const serviceActionError = (data) => dispatch => {
  //TODO update to a common file
  dispatch({
    type: ACTION_CONSTANTS.ERROR,
    payload: 'Error Handling API'
  })
}
