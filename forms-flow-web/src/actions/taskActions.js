import ACTION_CONSTANTS from './actionConstants'

export const getTaskList = (data) => dispatch =>{
    dispatch({
        type:ACTION_CONSTANTS.LIST_TASKS,
        payload:data
    })
}