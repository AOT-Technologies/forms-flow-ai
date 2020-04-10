export const saveValidationData = (data) => dispatch => {
  console.log('data', data)
  dispatch({
    type: 'SAVE_VALIDATION_DATA',
    payload: data
  })
}
