 /* istanbul ignore file */
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

export const setFormSubmissionLoading = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_FORM_SUBMISSION_LOADING,
    payload:data
  })
}

export const setFormDeleteStatus = (data) => dispatch =>{
    dispatch({
        type:ACTION_CONSTANTS.FORM_DELETE,
        payload:data
    })
}

export const setFormWorkflowSaved = (data) => dispatch =>{
    dispatch({
        type:ACTION_CONSTANTS.IS_FORM_WORKFLOW_SAVED,
        payload:data
    })
}

export const setBPMFormList = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.BPM_FORM_LIST,
    payload:data
  })
}

export const setBPMFormListLoading = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_BPM_FORM_LIST_LOADING,
    payload:data
  })
}

export const setBPMFormListPage = (page) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.BPM_FORM_LIST_PAGE_CHANGE,
    payload:page
  })
}

export const setBPMFormLimit = (pageLimit) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.BPM_FORM_LIST_LIMIT_CHANGE,
    payload:pageLimit
  })
}

export const setMaintainBPMFormPagination = (maintainList) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.BPM_MAINTAIN_PAGINATION,
    payload:maintainList
  })
}

export const setBPMFormListSort = (sort) => dispatch =>{
    dispatch({
      type:ACTION_CONSTANTS.BPM_FORM_LIST_SORT_CHANGE,
      payload:sort
    })
}

export const setFormSubmitted =(data)=>dispatch=>{
  dispatch({
    type:ACTION_CONSTANTS.PUBLIC_FORM_SUBMIT,
    payload:data
  })
}

export const setPublicFormStatus =(data)=>dispatch=>{
  dispatch({
    type:ACTION_CONSTANTS.PUBLIC_FORM_STATUS,
    payload:data
  })
}

export const setFormSuccessData =( name,
                                   form,
                                   url)=>dispatch=>{
   dispatch({
     type:ACTION_CONSTANTS.FORM_SUCCESS,
     form,
     name,
     url,
   })
 }

 export const setFormRequestData =(name, id, url)=>dispatch=>{
   dispatch({
     type:ACTION_CONSTANTS.FORM_REQUEST,
     name,
     id,
     url,
   })
 }

 export const resetFormData =(name)=>dispatch=>{
  dispatch({
    type:ACTION_CONSTANTS.FORM_RESET,
    name
  })
}

 export const setFormFailureErrorData =(name, error)=>dispatch=>{
   dispatch({
     type:ACTION_CONSTANTS.FORM_FAILURE,
     name,
     error
   })
 }

 export const setBpmFormSearch = (data) => dispatch =>{
   dispatch({
    type:ACTION_CONSTANTS.BPM_FORM_SEARCH,
    payload:data
   })
   return Promise.resolve()
 }

 export const setBpmFormLoading = (data) => dispatch =>{
  dispatch({
   type:ACTION_CONSTANTS.BPM_FORM_LOADING,
   payload:data
  })
}
