import ACTION_CONSTANTS from './actionConstants'

export const setUserToken = (data) => dispatch => {
  dispatch({
    type: ACTION_CONSTANTS.SET_USER_TOKEN,
    payload: data
  })
}

export const sendEmailNotification = (data) => dispatch => {
  dispatch({
    type: ACTION_CONSTANTS.SEND_EMAIL_NOTIFICATION,
    payload: data
  })
}

export const serviceActionError = (data) => dispatch => {
  console.log('data', data)
  dispatch({
    type: ACTION_CONSTANTS.ERROR,
    payload: 'Error Handling Message'
  })
}
