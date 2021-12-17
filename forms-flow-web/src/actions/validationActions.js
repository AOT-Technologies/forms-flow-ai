 /* istanbul ignore file */
export const saveValidationData = (data) => dispatch => {
  dispatch({
    type: 'SAVE_VALIDATION_DATA',
    payload: data
  })
}
