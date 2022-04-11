 /* istanbul ignore file */
import ACTION_CONSTANTS from './actionConstants'

//TODO Update set to get on below cases

export const serviceActionError = (data) => dispatch => {
   //TODO update to a common file
    dispatch({
      type: ACTION_CONSTANTS.ERROR,
      payload: 'Error Handling API'
    })
}


export const setApplicationHistoryList = (data) => dispatch =>{
    dispatch({
        type:ACTION_CONSTANTS.LIST_APPLICATION_HISTORY,
        payload:data
    })
}

export const setUpdateHistoryLoader = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_HISTORY_LOADING,
    payload:data
  })
}
