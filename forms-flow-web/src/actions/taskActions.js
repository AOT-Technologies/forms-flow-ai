import ACTION_CONSTANTS from './actionConstants'

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

export const serviceActionError = (data) => dispatch => {
    dispatch({
      type: ACTION_CONSTANTS.ERROR,
      payload: 'Error Handling API'
    })
}