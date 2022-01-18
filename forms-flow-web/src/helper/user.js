import { STAFF_REVIEWER, STAFF_DESIGNER } from "../constants/constants";
import {GROUPS} from "../constants/groupConstants";


/****
 * Default value of REACT_APP_USER_ACCESS_PERMISSIONS is {accessAllowApplications:false, accessAllowSubmissions:false}
 * This is to check if the view Submissions/view Application is to be shown with respect to group info or not
 *
 * Currently added groups for the purpose are applicationsAccess:["/formsflow/formsflow-reviewer/access-allow-applications","/formsflow/formsflow-client/access-allow-applications"],
 viewSubmissionsAccess:["/formsflow/formsflow-reviewer/access-allow-submissions"]
 *  ****/
export const defaultUserAccessGroupCheck={accessAllowApplications:false,accessAllowSubmissions:false};
let userAccessGroupCheck = (window._env_ && window._env_.REACT_APP_USER_ACCESS_PERMISSIONS) ||
process.env.REACT_APP_USER_ACCESS_PERMISSIONS || defaultUserAccessGroupCheck;

if(typeof(userAccessGroupCheck)==="string"){
  userAccessGroupCheck=JSON.parse(userAccessGroupCheck);
}

const getUserRoleName = (userRoles) => {
  let role = "";
  if (userRoles.includes(STAFF_REVIEWER)) {
    role = "REVIEWER";
  } else if (userRoles.includes(STAFF_DESIGNER)) {
    role = "DESIGNER";
  } else {
    role = "CLIENT";
  }
  return role;
};

const getNameFromEmail = (email) => email?email.substring(0, email.lastIndexOf("@")) : "" ;

const getUserRolePermission = (userRoles, role) => {
  return userRoles && userRoles.includes(role);
};

const setShowApplications = (userGroups)=>{
  if(!userAccessGroupCheck.accessAllowApplications){
    return true;
  }else if(userGroups?.length){
    const applicationAccess = GROUPS.applicationsAccess.some((group)=> userGroups.includes(group));
    return applicationAccess;
  }else{
    return false;
  }
}

const setShowViewSubmissions = (userGroups)=>{
  if(!userAccessGroupCheck.accessAllowSubmissions){
    return true;
  }else if(userGroups?.length){
    const viewSubmissionAccess = GROUPS.viewSubmissionsAccess.some((group)=> userGroups.includes(group));
    return viewSubmissionAccess;
  }else{
    return false;
  }
}

const getUserInsightsPermission = ()=>{
  let user = localStorage.getItem("UserDetails");
  if(!user){
    return false
  }
  user = JSON.parse(user);
  if(!user?.dashboards){
    return false
  }
  return true
}

export { getUserRoleName, getUserRolePermission, getNameFromEmail, setShowApplications, setShowViewSubmissions, getUserInsightsPermission };
