import {  httpGETRequest } from '../httpRequestHandler';
import API from '../endpoints';
import { serviceActionError } from '../../actions/taskActions'; //TODO move to a common action
import { getDashboards, getDashboardDetail} from '../../actions/insightActions';
import INSIGHTS from "../constants/insightConstants";

export const fetchDashboardsList = (id, ...rest) =>{
  const done = rest.length ? rest[0] :  ()=>{};
  return dispatch=>{
    httpGETRequest(API.GET_DASHBOARDS, null, INSIGHTS.authToken, false).then(res=>{
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

export const fetchDashboardDetails = (id, ...rest) =>{
  console.log("id...", id);
  const done = rest.length ? rest[0] :  ()=>{};
  return dispatch=>{
    httpGETRequest(`${API.GET_DASHBOARDS}/${id}`, null, INSIGHTS.authToken, false).then(res=>{
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
