import {  httpGETRequest } from '../httpRequestHandler';
import API from '../endpoints';
import { serviceActionError } from '../../actions/taskActions'; //TODO move to a common action
import { getDashboards, getDashboardDetail} from '../../actions/insightActions';

export const getDashboardsList = (id, ...rest) =>{
  const done = rest.length ? rest[0] :  ()=>{};
  return dispatch=>{
    httpGETRequest(API.GET_DASHBOARDS).then(res=>{
      if (res.data) {
        dispatch(getDashboards(res.data))
        done(null,res);
      } else {
        dispatch(serviceActionError(res))
        done('Error Getting data');
      }
    }).catch((error) => {
      console.log(error)
      dispatch(serviceActionError(error))
      done(error);
    })
  }
}

export const getDashboardDetails = (id, ...rest) =>{
  const done = rest.length ? rest[0] :  ()=>{};
  return dispatch=>{
    httpGETRequest(`${API.GET_DASHBOARDS}/${id}`).then(res=>{
      if (res.data) {
        dispatch(getDashboardDetail(res.data))
        done(null,res);
      } else {
        dispatch(serviceActionError(res))
        done('Error Getting data');
      }
    }).catch((error) => {
      console.log(error)
      dispatch(serviceActionError(error))
      done(error);
    })
  }
}
