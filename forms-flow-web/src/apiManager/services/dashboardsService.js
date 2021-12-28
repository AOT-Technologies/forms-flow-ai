 /* istanbul ignore file */
import { httpGETRequest,httpPUTRequest } from "../httpRequestHandler";
import { setDashboards,dashboardErrorHandler,setGroups,updateErrorHandler, hideUpdateError } from "../../actions/dashboardActions";
import API from '../endpoints/index'
import { replaceUrl } from "../../helper/helper";

export const updateGroup = (data)=>{
  const apiUpdateGroup = replaceUrl(
    API.UPDATE_GROUPS,
    "<groupId>",
    data.group
  );
  return (dispatch) => {
    httpPUTRequest(apiUpdateGroup,{dashboards:data.dashboards})
    .then((res)=>{
      if(res.data){
        dispatch(fetchdashboards());
        dispatch(fetchGroups())
      }else{
        dispatch(updateErrorHandler("Update Failed"));
        setTimeout(() => {
          dispatch(hideUpdateError());
        }, 2000);
      }
    })
    .catch((error)=>{
      dispatch(updateErrorHandler(error));
      setTimeout(() => {
        dispatch(hideUpdateError());
      }, 2000);
    })
  }
}

export const fetchdashboards = ()=>{
    return (dispatch) => {
        httpGETRequest(API.GET_DASHBOARDS)
          .then((res) => {
            if (res.data) {
              dispatch(setDashboards(res.data));
            } else {
              dispatch(dashboardErrorHandler("No dashboards found"));
            }
          })
          .catch((error) => {
            if(error?.response?.data){
              dispatch(dashboardErrorHandler(error.response.data));
            }else{
              dispatch(dashboardErrorHandler("Failed to fetch dashboards"));
            }
          });
      };
}

export const fetchGroups = ()=>{
    return (dispatch) => {
        httpGETRequest(API.GET_GROUPS)
          .then((res) => {
            if (res.data) {
              const cleanedGroups = cleanGroups(res.data);
                dispatch(setGroups(cleanedGroups))    
            } else {
              dispatch(dashboardErrorHandler("No groups found"));
            }
          })
          .catch((error) => {
            if(error?.response?.data){
              dispatch(dashboardErrorHandler(error.response.data));
            }else{
              dispatch(dashboardErrorHandler("Failed to fetch groups"));
            }
          });
      };
  
}

// dashboards property should be cleaned before updating the store
export const cleanGroups = (groups)=>{

    if(groups?.length === 0){
      return groups;
    }

    let newGroups = [...groups];

    for(let group of newGroups){
        group.dashboards = getCleanedDashboards(group.dashboards)
    }

    return newGroups;

}

// since the data we need is not a valid json / or stringified json, the approach taken 
// to extract the data is string manipulation and create the objects from the extracted information.

// input format --> dashboards: [
//    "[{'5': 'Hello'}, {'4': 'testathira'}, {'6': 'New Business License Application'}, {'8': 'Sentiment Analysis'}, {'7': 'Freedom Of Information Form'}, {'3': 'test'}, {'12': 'dashboard4'}]"
//]
//output format --> dashboards:[
//  {'5': 'Hello'}, {'4': 'testathira'}, {'6': 'New Business License Application'}, {'8': 'Sentiment Analysis'}, {'7': 'Freedom Of Information Form'}, {'3': 'test'}, {'12': 'dashboard4'}
//]
export const getCleanedDashboards = (dashboards)=>{
  // possible edge case 
  if( dashboards === null || dashboards.length === 0 ){
    return []
  }

    dashboards = dashboards[0];
    dashboards = dashboards.substring(1,dashboards.length-1);
    dashboards = dashboards.split(",");

  let newdash = [];

  for(let str of dashboards){
    // avoiding unwanted entries
    if(str === "{}" || str === ""){
      // skip the remaining process for above conditions
      continue;
    }
      let substr = str.substring(1,str.length-1);
          // to identify possible object patterns and to extract the key and value splits the string based on ":" seperator
      let substrArray = substr.split(":");
      let newObj = {};
      let id = null;

    // The data given by the api seems to have consistent patterns which are essential for 
    // a non fragile implmentation. All the entries after the first entry in the string representation of the array have
    // space before the entry, so need to handle the two cases

      if(dashboards.indexOf(str) === 0){
        id = Number(substrArray[0]?.substring(1,substrArray[0].length-1));

      }else{
        id = Number(substrArray[0]?.substring(2,substrArray[0].length-1));

      }
      newObj[id] = substrArray[1]?.substring(2,substrArray[1].length-1);
      newdash.push(newObj)
  }

  return newdash;
}

