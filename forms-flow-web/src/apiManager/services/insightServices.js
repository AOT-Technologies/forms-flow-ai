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
import { result } from 'lodash';

// for global scope to avoid data duplication
let addedIdxs = [];

export const fetchDashboardsList = (...rest) =>{
  return dispatch=>{
    let result = [];
        addedIdxs=[];
    let dashboards = localStorage.getItem("UserDetails");
    dashboards = JSON.parse(dashboards);
    dashboards = dashboards.dashboards;
   
    for(let dashboard of dashboards){
      let entry = fetchCleanedDashboardsFromLocalStorage(dashboard)
      result = [...result,...entry]
    }
    dispatch(getDashboards(result))
  }
}

export const fetchDashboardDetails = (id, ...rest) =>{
  const done = rest.length ? rest[0] :  ()=>{};
  return dispatch=>{
    httpGETRequest(`${API.GET_DASHBOARDS}/${id}`).then(res=>{
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

// retrieves the associated dashboards from the string data
export const fetchCleanedDashboardsFromLocalStorage = (dashboards)=>{
  let result =[];

  let dashboardsString = dashboards.substring(1,dashboards.length-1);
  let dashboardsArray = dashboardsString.split(",")
  for(let dashboard of dashboardsArray){
    if(dashboard === "{}" || dashboard === ""){
      // break out of the loop for invalid entries
      continue;
    }
      let item = dashboard.split(":");
      let id =null;
      if(dashboardsArray.indexOf(dashboard) === 0){
          id = Number(item[0]?.substring(2,item[0].length-1))
      }else{
          id = Number(item[0]?.substring(3,item[0].length-1))
      }
      let val = item[1]?.substring(2,item[1].length-2);
      let obj ={};
     
      // avoid possible duplicate entries
      if(!addedIdxs.includes(id)){
        obj['value'] = id;
        obj['label'] =val;
       result.push(obj)
       addedIdxs.push(id)
      }
      
  }
  return result;
}