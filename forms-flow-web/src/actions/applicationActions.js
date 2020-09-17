import ACTION_CONSTANTS from './actionConstants'

export const setApplicationList = (data) => dispatch =>{
    dispatch({
        type:ACTION_CONSTANTS.LIST_APPLICATIONS,
        payload:data
    })
}

export const setApplicationListByFormId = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.LIST_APPLICATIONS_OF_FORM,
    payload:data
  })
}

export const setApplicationDetail = (data) => dispatch =>{
    dispatch({
        type:ACTION_CONSTANTS.APPLICATION_DETAIL,
        payload:data
    })
}

export const setApplicationListLoader = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_APPLICATION_LIST_LOADING,
    payload:data
  })
}

export const setApplicationDetailLoader = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_APPLICATION_DETAIL_LOADING,
    payload:data
  })
}

export const serviceActionError = (data) => dispatch => {
  //TODO update to a common file
  console.log(data);
  dispatch({
    type: ACTION_CONSTANTS.ERROR,
    payload: 'Error Handling API'
  })
}
