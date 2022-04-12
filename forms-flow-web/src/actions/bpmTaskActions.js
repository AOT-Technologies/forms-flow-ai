 /* istanbul ignore file */
import ACTION_CONSTANTS from './actionConstants'

export const setBPMTaskLoader = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_BPM_TASK_LOADING,
    payload:data
  })
}

export const setBPMTaskDetailLoader = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_BPM_TASK_DETAIL_LOADING,
    payload:data
  })
}

export const updateBPMTaskGroups = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.SET_TASK_GROUP,
    payload:data
  })
}


export const setBPMTaskGroupsLoading = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_TASK_GROUP_LOADING,
    payload:data
  })
}


export const setBPMTaskDetailUpdating = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_BPM_TASK_DETAIL_UPDATING,
    payload:data
  })
}

export const setBPMTaskUpdateLoader = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_BPM_TASK_UPDATING,
    payload:data
  })
}

//TODO Update set to get on below cases

export const setBPMTaskList = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.BPM_LIST_TASKS,
    payload:data
  })
}


export const setBPMProcessList = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.BPM_PROCESS_LIST,
    payload:data
  })
}


export const setBPMUserList = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.BPM_USER_LIST,
    payload:data
  })
}

export const setBPMTaskCount = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.BPM_TASKS_COUNT,
    payload:data
  })
}

export const setBPMTaskListActivePage = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.BPM_TASK_LIST_ACTIVE_PAGE,
    payload:data
  })
}

export const setBPMTaskDetail = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.BPM_TASK_DETAIL,
    payload:data
  })
}

export const setBPMFilterLoader = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.IS_BPM_FILTERS_LOADING,
    payload:data
  })
}

export const setBPMFilterList = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.BPM_FILTER_LIST,
    payload:data
  })
}

export const setSelectedBPMFilter = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.BPM_SELECTED_FILTER,
    payload:data
  })
}

export const setSelectedTaskID = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.SELECTED_TASK_ID,
    payload:data
  })
}

export const setFilterListSortParams = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.UPDATE_FILTER_LIST_SORT_PARAMS,
    payload:data
  })
}

export const setFilterListSearchParams = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.UPDATE_FILTER_LIST_SEARCH_PARAMS,
    payload:data
  })
}

export const setFilterListParams = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.UPDATE_LIST_PARAMS,
    payload:data
  })
}

export const setSearchQueryType = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.UPDATE_SEARCH_QUERY_TYPE,
    payload:data
  })
}

export const setIsVariableNameIgnoreCase = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.UPDATE_VARIABLE_NAME_IGNORE_CASE,
    payload:data
  })
}

export const setIsVariableValueIgnoreCase = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.UPDATE_VARIABLE_VALUE_IGNORE_CASE,
    payload:data
  })
}

export const reloadTaskFormSubmission = (data) => dispatch =>{
  dispatch({
    type:ACTION_CONSTANTS.RELOAD_TASK_FORM_SUBMISSION,
    payload:data
  })
}

export const serviceActionError = (data) => dispatch => {
  //TODO update to a common file
  dispatch({
    type: ACTION_CONSTANTS.ERROR,
    payload: 'Error Handling API'
  })
}
