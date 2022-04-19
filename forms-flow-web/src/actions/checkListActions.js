 /* istanbul ignore file */
import ACTION_CONSTANTS from "./actionConstants";

export const setFormCheckList = (listData) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.FORM_CHECK_LIST_UPDATE,
    payload:listData
  })
}

export const setFormUploadList = (listData) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.FORM_UPLOAD_LIST,
    payload:listData
  })
}

export const updateFormUploadCounter = () => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.FORM_UPLOAD_COUNTER,
  })
}

export const setFormLoading = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_FORM_LOADING,
    payload:data
  })
}


