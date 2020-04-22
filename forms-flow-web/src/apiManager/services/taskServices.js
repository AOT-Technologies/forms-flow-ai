import {  httpGETRequest } from '../httpRequestHandler'
import API from '../endpoints'
import { setTaskList, serviceActionError } from '../../actions/taskActions'

export const fetchTaskList = (data) =>{
    return dispatch => {
      httpGETRequest(API.GET_TASK_API).then(res => {
          if (res.data) {
            console.log('Res',res.data)
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