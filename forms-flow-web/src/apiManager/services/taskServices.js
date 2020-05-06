import {  httpGETRequest, httpPOSTRequest } from '../httpRequestHandler'
import API from '../endpoints'
import { setTaskList, setTaskCount, serviceActionError, setLoader, setTaskDetail } from '../../actions/taskActions'

export const fetchTaskList = () =>{
    return dispatch => {
      httpPOSTRequest(API.GET_TASK_API,{"taskVariables":[]}).then(res => {
          if (res.data) {
            dispatch(setTaskList(res.data))
            dispatch(setLoader(false))
          } else {
            console.log('Error',res);
            dispatch(serviceActionError(res))
            dispatch(setLoader(false))
          }
        }).catch((error) => {
          console.log('Error',error);
          dispatch(serviceActionError(error))
          dispatch(setLoader(false))
        })
      }
}
export const getTaskCount = () =>{
    return dispatch => {
      httpPOSTRequest(API.GET_TASK_COUNT,{"taskVariables":[]}).then(res => {
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
    httpGETRequest(`${API.GET_TASK_DETAIL_API}${id}`).then(res=>{
      if(res.status === 200){
        dispatch(setTaskDetail(res.data[0]))
        dispatch(setLoader(false))
      }
    })
    .catch(error=>{
      dispatch(serviceActionError(error))
      dispatch(setLoader(false))
    })
  }
}

export const getTaskSubmissionDetails = (id) =>{
  return dispatch=>{
    httpGETRequest(`${API.GET_TASK_SUBMISSION_DATA}${id}`).then(res=>{
      if(res.status === 200){
       // new dispatch needed ..... dispatch(setTaskDetail(res.data))
        dispatch(setLoader(false))
      }
    })
      .catch(error=>{
        dispatch(serviceActionError(error))
        dispatch(setLoader(false))
      })
  }
}

export const claimTask = (id,user, ...rest)=>{
  // console.log("Claimed",id,user)
  const done = rest.length ? rest[0] :  ()=>{};
  return dispatch=>{
    httpPOSTRequest(`${API.TASK_ACTION_API}/${id}/claim`,{userId:user}).then(res=>{
      if(res.status === 204){
        //TODO REMOVE
        done(null,res.data);
      }
    }).catch(error=>{
      console.log('Error',error)
      dispatch(serviceActionError(error))
      done(error);
    })
  }
}
export const unClaimTask = (id, ...rest)=>{
  const done = rest.length ? rest[0] :  ()=>{};
  return dispatch=>{
    httpPOSTRequest(`${API.TASK_ACTION_API}/${id}/unclaim`).then(res=>{
      if(res.status === 204){
        //TODO REMOVE
        done(null,res.data);
      }
    }).catch(error=>{
      console.log('Error',error)
      dispatch(serviceActionError(error));
      done(error);
    })
  }
}
export const completeTask=(id,reviewStatus)=>{
  const data={
    "variables": {
      "action": {
        "value":  reviewStatus
        }
   }
  }
  return dispatch=>{
    httpPOSTRequest(`${API.TASK_ACTION_API}/${id}/complete`,data).then(res=>{
      dispatch(getTaskDetail(id))
    }).catch(error=>{
      console.log('Error',error)
      dispatch(serviceActionError(error))
    })
  }
}


