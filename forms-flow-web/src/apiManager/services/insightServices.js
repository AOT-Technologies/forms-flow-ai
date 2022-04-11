 /* istanbul ignore file */
import {  httpGETRequest } from '../httpRequestHandler';
import API from '../endpoints';
import { serviceActionError } from '../../actions/taskApplicationHistoryActions'; //TODO move to a common action
import {
  getDashboards,
  getDashboardDetail,
  setInsightDetailLoader,
  setInsightDashboardListLoader
} from '../../actions/insightActions';

// To keep track of the Indexes that were added to prevent duplication
let addedIdxs = [];

export const fetchDashboardsList = (dashboardsFromRedash) =>{
  return dispatch=>{
    let result = [];
        addedIdxs=[];
    let dashboards = localStorage.getItem("UserDetails");
    if(!dashboards){
        dispatch(setInsightDashboardListLoader(false))
        dispatch(setInsightDetailLoader(false));
      return dispatch(serviceActionError("No Dashboards found"))
    }
    dashboards = JSON.parse(dashboards).dashboards;
    for(let dashboard of dashboards){
      let entry = fetchCleanedDashboardsFromLocalStorage(dashboard,dashboardsFromRedash)
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
export const fetchCleanedDashboardsFromLocalStorage = (dashboards,dashboardsFromRedash)=>{

  // since the data we need is not a valid json / or stringified json, the approach taken
  // to extract the data is string manipulation and create the objects from the extracted information.

  let result =[];
  let dashboardsString = dashboards.substring(1,dashboards.length-1);
  let dashboardsArray = dashboardsString.split(",")

  for(let dashboard of dashboardsArray){
    if(dashboard === "{}" || dashboard === ""){
      // skip the remaining steps for the above entries
      continue;
    }
    // to identify possible object patterns and to extract the key and value splits the string based on ":" seperator
      let item = dashboard.split(":");
      let id =null;
    // The data given by the api seems to have consistent patterns which are essential for
    // a non fragile implmentation. All the entries after the first entry in the string representation of the array have
    // space before the entry, so need to handle the two cases
      if(dashboardsArray.indexOf(dashboard) === 0){
          id = Number(item[0]?.substring(2,item[0].length-1))
      }else{
          id = Number(item[0]?.substring(3,item[0].length-1))
      }
      let val = item[1]?.substring(2,item[1].length-2);
      let obj ={};
      // check wheather the dashboard is out dated or not by comparing with the redash dashboards api
      for(let redash of dashboardsFromRedash){
        if(id === redash.id && val === redash.name){
          // avoid possible duplicate entries by keeping track of all the ids that were added
              if(!addedIdxs.includes(id)){
                obj['value'] = id;
                obj['label'] =val;
              result.push(obj)
              addedIdxs.push(id)
              }
        }
      }
  }
  return result;
}
