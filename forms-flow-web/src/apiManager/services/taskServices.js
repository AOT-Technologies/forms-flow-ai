import {  httpPOSTRequest } from '../httpRequestHandler'
import API from '../endpoints'
import Token from "../token/tokenService"
import { getTaskList } from '../../actions/taskActions';

export const fetchTaskList = () =>{
    const url = API.BASE_API_URL+'/history/task'
    console.log('in here',url)
    return dispatch => {
        httpPOSTRequest(url).then(res => {
          if (res.data) {
            console.log('rnjwe',res.data)
          } else {
            console.log('Error Posting data');
          }
        }).catch((error) => {
            console.log('Error',error);
        })
      }
}