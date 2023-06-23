import { STAFF_REVIEWER, STAFF_DESIGNER } from "../constants/constants";
import { GROUPS } from "../constants/groupConstants";
import {featureFlags} from "../featureToogle";

/****
 * Default value of REACT_APP_ENABLE_APPLICATION_ACCESS_PERMISSION_CHECK is false
 * This is to check if the Application tab is to be shown with respect to group info or not
 *
 * Currently added groups for the purpose are applicationsAccess:
 * ["/formsflow/formsflow-reviewer/access-allow-applications",
 * "/formsflow/formsflow-client/access-allow-applications"]
 *  ****/
const userAccessGroupCheckforApplications = featureFlags.enableApplicationAccessPermissionCheck;

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

const getNameFromEmail = (email) =>
  email ? email.substring(0, email.lastIndexOf("@")) : "";

const getUserRolePermission = (userRoles, role) => {
  return userRoles && userRoles.includes(role);
};

const setShowApplications = (userGroups) => {
  if (!userAccessGroupCheckforApplications) {
    return true;
  } else if (userGroups?.length) {
    const applicationAccess = GROUPS.applicationsAccess.some((group) =>
      userGroups.includes(group)
    );
    return applicationAccess;
  } else {
    return false;
  }
};

const getUserInsightsPermission = () => {
  let user = localStorage.getItem("UserDetails");
  if (!user) {
    return false;
  }
  user = JSON.parse(user);
  if (!user?.dashboards) {
    return false;
  }
  return true;
};

const setUserRolesToObject = (response)=>{
  let roleObject = {};
  response.forEach(role => {
    roleObject[role.type] = role.roleId;
  });
  return roleObject;
};

export {
  getUserRoleName,
  getUserRolePermission,
  getNameFromEmail,
  setShowApplications,
  getUserInsightsPermission,
  setUserRolesToObject
};
