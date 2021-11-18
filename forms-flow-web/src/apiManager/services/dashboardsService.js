import { httpGETRequest,httpPUTRequest } from "../httpRequestHandler";
import { setDashboards,dashboardErrorHandler,setGroups,updateErrorHandler } from "../../actions/dashboardActions";
import API from '../endpoints/index'
import { replaceUrl } from "../../helper/helper";


export const updateGroup = (data)=>{
  // const groupsEndpoint = `${process.env.REACT_APP_WEB_BASE_URL}/groups/${data.group}`;
  const apiUpdateGroup = replaceUrl(
    API.UPDATE_GROUPS,
    "<groupId>",
    data.group
  );
  return (dispatch) => {
    httpPUTRequest(apiUpdateGroup,{dashboards:data.dashboards})
    .then((res)=>{
      if(res.data){
       dispatch(fetchGroups())
      }else{
        console.log("update error");
        dispatch(updateErrorHandler("Groups not found"));
        dispatch(fetchGroups())
      }
    })
    .catch((error)=>{
      console.log("update error",error);
      dispatch(updateErrorHandler(error));
      dispatch(fetchGroups())
    })
  }
}

export const fetchdashboards = ()=>{
    // should move the endpoint to an env variable
    // const getDashboardsEndpoint = `${process.env.REACT_APP_WEB_BASE_URL}/dashboards`;
    return (dispatch) => {
        httpGETRequest(API.GET_DASHBOARDS)
          .then((res) => {
            if (res.data) {
              dispatch(setDashboards(res.data));
            } else {
              console.log("Error", res);
              dispatch(dashboardErrorHandler("Dashboards not found"));
            }
          })
          .catch((error) => {
            console.log("Error", error);
            dispatch(dashboardErrorHandler(error));
          });
      };
}



// possible data format

export const fetchGroups = ()=>{
  // in development
  const groupsEndpoint = `${process.env.REACT_APP_WEB_BASE_URL}/groups`;
    return (dispatch) => {
        httpGETRequest(API.GET_GROUPS)
          .then((res) => {
            if (res.data) {
              const cleanedGroups = cleanGroups(res.data);
                dispatch(setGroups(cleanedGroups))
              
            } else {
              console.log("Error", res);
              dispatch(dashboardErrorHandler(res));
            }
          })
          .catch((error) => {
            console.log("Error", error);
            dispatch(dashboardErrorHandler(error));
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

// string manipulation to return array of objects format. 
export const getCleanedDashboards = (dashboards)=>{

  if( dashboards === null ){
    return []
  }

  if(dashboards.length === 0){
    return dashboards
  }
    dashboards = dashboards[0];
    dashboards = dashboards.substring(1,dashboards.length-1);
    dashboards = dashboards.split(",");
  let newdash = [];
  for(let str of dashboards){
    // avoiding unwanted entries
    if(str === "{}" || str === ""){
      continue;
    }
      let substr = str.substring(1,str.length-1);
      let substrArray = substr.split(":");
      let newObj = {};
      let id = null;
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

