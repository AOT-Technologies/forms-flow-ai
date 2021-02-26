import {  httpGETRequest } from '../httpRequestHandler';
import API from '../endpoints';
import { serviceActionError } from '../../actions/taskActions'; //TODO move to a common action
import {
  getDashboards,
  getDashboardDetail,
  setInsightDashboardListLoader,
  setInsightDetailLoader
} from '../../actions/insightActions';
import { insightDashboardFormatter }  from "./formatterService"
export const fetchDashboardsList = (...rest) =>{
  const done = rest.length ? rest[0] :  ()=>{};
  return dispatch=>{
    httpGETRequest(API.GET_DASHBOARDS, null, API.INSIGHTS_API_KEY, false).then(res=>{
      if (res.data) {
        const dashboardList = res.data.results && res.data.results.length? insightDashboardFormatter(res.data.results): [];
        dispatch(getDashboards(dashboardList))
        dispatch(setInsightDashboardListLoader(false));
        done(null,res);
      } else {
        dispatch(setInsightDashboardListLoader(false))
        dispatch(setInsightDetailLoader(false));
        dispatch(serviceActionError(res))
        done('Error Getting data');
      }
    }).catch((error) => {
      dispatch(setInsightDashboardListLoader(false))
      dispatch(setInsightDetailLoader(false));
      console.log(error)
      dispatch(serviceActionError(error))
      done(error);
    })
  }
}

export const fetchDashboardDetails = (id, ...rest) =>{
  const done = rest.length ? rest[0] :  ()=>{};
  return dispatch=>{
    httpGETRequest(`${API.GET_DASHBOARDS}/${id}`, null, API.INSIGHTS_API_KEY, false).then(res=>{
      if (res.data) {
        dispatch(getDashboardDetail(res.data));
        dispatch(setInsightDetailLoader(false));
        done(null,res);
      } else {
        dispatch(setInsightDetailLoader(false));
        dispatch(serviceActionError(res))
        done('Error Getting data');
      }
    }).catch((error) => {
      console.log(error);
      dispatch(setInsightDetailLoader(false));
      dispatch(serviceActionError(error))
      done(error);
    })
  }
}
