import { getUserRoleName, getUserRolePermission, getNameFromEmail,setShowApplications,setShowViewSubmissions,defaultUserAccessGroupCheck } from "../../helper/user";
import '@testing-library/jest-dom/extend-expect';

// test cases for getUserRoleName function
test("Should return correct role based on the input array",()=>{
    expect(getUserRoleName([])).toBe('CLIENT');
    expect(getUserRoleName(['formsflow-client'])).toBe('CLIENT');
    expect(getUserRoleName(['formsflow-designer'])).toBe('DESIGNER');
    expect(getUserRoleName(['formsflow-reviewer'])).toBe('REVIEWER')
    expect(getUserRoleName(['formsflow-reviewer','formsflow-designer'])).toBe('REVIEWER')
})

// test cases for getUserRolePermission
test("Should check if the provided role exists in the first parameter",()=>{
    expect(getUserRolePermission([],"formsflow-client")).toBeFalsy();
    expect(getUserRolePermission(['formsflow-client'],"formsflow-client")).toBeTruthy();
    expect(getUserRolePermission(['formsflow-designer'],"formsflow-client")).toBeFalsy();
    expect(getUserRolePermission(['formsflow-designer','formsflow-client'],"formsflow-client")).toBeTruthy();
    expect(getUserRolePermission(['formsflow-reviewer'])).toBeFalsy();
    expect(getUserRolePermission()).toBe(undefined)
})

// test cases for getNameFromEmail
test("should return the name from an email string",()=>{
    expect(getNameFromEmail("name@gmail.com")).toBe('name')
    expect(getNameFromEmail("@name@gmail.com")).toBe('@name')
    expect(getNameFromEmail("")).toBe('')
})
  
// test cases for setShowApplications

test("should check wheather to show applications or not",()=>{

    expect(setShowApplications()).toBeTruthy();
    defaultUserAccessGroupCheck.accessAllowApplications=true;
    expect(setShowApplications(["/camunda-admin","/formsflow/formsflow-designer"])).toBeFalsy();
    expect(setShowApplications([])).toBeFalsy();
    expect(setShowApplications(["/formsflow/formsflow-reviewer/access-allow-applications"])).toBeTruthy();
   
})

// test cases for setShowViewSubmissions

test("should check wheather to show submissions or not",()=>{
    expect(setShowViewSubmissions()).toBeTruthy();
    defaultUserAccessGroupCheck.accessAllowSubmissions=true;
    expect(setShowViewSubmissions([])).toBeFalsy();
    expect(setShowViewSubmissions(["/formsflow/formsflow-reviewer/access-allow-submissions"])).toBeTruthy();

})


afterAll(()=>{
    defaultUserAccessGroupCheck.accessAllowApplications = false;
    defaultUserAccessGroupCheck.accessAllowSubmissions=false;
})