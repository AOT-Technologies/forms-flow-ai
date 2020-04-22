import {  httpGETRequest, httpPOSTRequest } from '../httpRequestHandler'
import API from '../endpoints'
import { setTaskList, setTaskCount, serviceActionError } from '../../actions/taskActions'

export const fetchTaskList = () =>{
    return dispatch => {
      httpGETRequest(API.GET_TASK_API).then(res => {
          if (res.data) {
            dispatch(setTaskList(res.data))
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

// export const claimTask = (data)=>{
//   return dispatch=>{
//     httpPOSTRequest(API.CLAIM_TASK).then(res=>{
//       if(res.data){
//         console.log("Task_Claimed")
//       }
//     }).catch(error=>{
//       console.log('Error',error)
//       dispatch(serviceActionError(error))
//     })
//   }
// }