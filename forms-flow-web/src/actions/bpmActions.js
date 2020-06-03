import ACTION_CONSTANTS from './actionConstants'

export const setCurrentPage = (data) => dispatch => {
  dispatch({
    type:ACTION_CONSTANTS.SET_CURRENT_PAGE,
    payload:data
  })
}

export const setUserAuth = (data) => dispatch => {
  dispatch({
    type: ACTION_CONSTANTS.SET_USER_AUTHENTICATION,
    payload: data
  })
}

export const setUserToken = (data) => dispatch => {
  dispatch({
    type: ACTION_CONSTANTS.SET_USER_TOKEN,
    payload: data
  })
}

export const setUserRole = (data) => dispatch => {
  dispatch({
    type: ACTION_CONSTANTS.SET_USER_ROLES,
    payload: data
  })
}
export const setUserDetails = (data) => dispatch => {
  localStorage.setItem('UserDetails', JSON.stringify(data));
  dispatch({
    type: ACTION_CONSTANTS.SET_USER_DETAILS,
    payload: data
  })
}

export const sendEmailNotification = (data) => dispatch => {
  dispatch({
    type: ACTION_CONSTANTS.SEND_EMAIL_NOTIFICATION,
    payload: data
  })
}
export const sendOneStepApproval = (data) => dispatch => {
  dispatch({
    type: ACTION_CONSTANTS.SEND_ONE_STEP_APPROVAL,
    payload: data
  })
}

export const serviceActionError = (data) => dispatch => {
  dispatch({
    type: ACTION_CONSTANTS.ERROR,
    payload: 'Error Handling Message'
  })
}
