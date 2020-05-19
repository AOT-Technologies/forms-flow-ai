import ACTION_CONSTANTS from './actionConstants'

export const setLoader = (data) => dispatch =>{
    dispatch({
        type:ACTION_CONSTANTS.IS_LOADING,
        payload:data
    })
}

export const setTaskList = (data) => dispatch =>{
    dispatch({
        type:ACTION_CONSTANTS.LIST_TASKS,
        payload:data
    })
}
export const setTaskCount = (data) => dispatch =>{
    dispatch({
        type:ACTION_CONSTANTS.TASKS_COUNT,
        payload:data
    })
}
export const setTaskDetail = (data) => dispatch =>{
    dispatch({
        type:ACTION_CONSTANTS.TASK_DETAIL,
        payload:data
    })
}

export const setTaskSubmissionDetail = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.TASK_SUBMISSION_DETAIL,
    payload:data
  })
}

export const serviceActionError = (data) => dispatch => {
    dispatch({
      type: ACTION_CONSTANTS.ERROR,
      payload: 'Error Handling API'
    })
}

export const setUpdateLoader = (data) => dispatch =>{
    dispatch({
        type:ACTION_CONSTANTS.IS_TASK_UPDATING,
        payload:data
    })
}
