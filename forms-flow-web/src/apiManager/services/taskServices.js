import {  httpGETRequest, httpPOSTRequest } from '../httpRequestHandler'
import API from '../endpoints'
import { setTaskList, setTaskCount, serviceActionError, setLoader, setTaskDetail } from '../../actions/taskActions'

export const fetchTaskList = () =>{
    return dispatch => {
      httpGETRequest(API.GET_TASK_API).then(res => {
          if (res.data) {
            dispatch(setTaskList(res.data))
            dispatch(setLoader(false))
          } else {
            console.log('Error',res);
            dispatch(serviceActionError(res))
          }
        }).catch((error) => {
          console.log('Error',error);
          dispatch(serviceActionError(error))
        })
      }
}
export const getTaskCount = () =>{
    return dispatch => {
      httpGETRequest(API.GET_TASK_COUNT).then(res => {
          if (res.data) {
            dispatch(setTaskCount(res.data))
          } else {
            console.log('Error',res);
            dispatch(serviceActionError(res))
          }
        }).catch((error) => {
          console.log('Error',error);
          dispatch(serviceActionError(error))
        })
      }
}

export const getTaskDetail = (id) =>{
  return dispatch=>{
    httpGETRequest(API.TASK_ACTION_API+`/${id}`).then(res=>{
      if(res.status === 200){
        dispatch(setTaskDetail(res.data))
        dispatch(setLoader(false))
      }
    })
    .catch(error=>{
      dispatch(serviceActionError(error))
    })
  }
}

export const claimTask = (id,user)=>{
  // console.log("Claimed",id,user)
  return dispatch=>{
    httpPOSTRequest(API.TASK_ACTION_API+`/${id}/claim`,{userId:user}).then(res=>{
      if(res.status === 204){
        dispatch(setLoader(true))
        dispatch(fetchTaskList())
      }
    }).catch(error=>{
      console.log('Error',error)
      dispatch(serviceActionError(error))
    })
  }
}
export const unClaimTask = (id)=>{
  return dispatch=>{
    httpPOSTRequest(API.TASK_ACTION_API+`/${id}/unclaim`).then(res=>{
      if(res.status === 204){
        dispatch(fetchTaskList())
      }
    }).catch(error=>{
      console.log('Error',error)
      dispatch(serviceActionError(error))
    })
  }
}