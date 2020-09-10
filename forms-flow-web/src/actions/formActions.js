import ACTION_CONSTANTS from './actionConstants'

export const setFormSubmissionDeleteStatus = (data) => dispatch =>{
    dispatch({
        type:ACTION_CONSTANTS.FORM_SUBMISSION_DELETE,
        payload:data
    })
}
export const setFormSubmissionError = (data) => dispatch =>{
    dispatch({
        type:ACTION_CONSTANTS.FORM_SUBMISSION_ERROR,
        payload:data
    })
}
export const setFormDeleteStatus = (data) => dispatch =>{
    dispatch({
        type:ACTION_CONSTANTS.FORM_DELETE,
        payload:data
    })
}

