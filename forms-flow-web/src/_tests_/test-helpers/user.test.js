import {
  getUserRoleName,
  getUserRolePermission,
  getNameFromEmail,
  setShowApplications,
  userAccessGroupCheck
} from "../../helper/user";
import "@testing-library/jest-dom/extend-expect";

// test cases for getUserRoleName function
test("Should return correct role based on the input array", () => {
  expect(getUserRoleName([])).toBe("CLIENT");
  expect(getUserRoleName(["formsflow-client"])).toBe("CLIENT");
  expect(getUserRoleName(["formsflow-designer"])).toBe("DESIGNER");
  expect(getUserRoleName(["formsflow-reviewer"])).toBe("REVIEWER");
  expect(getUserRoleName(["formsflow-reviewer", "formsflow-designer"])).toBe(
    "REVIEWER"
  );
});

// test cases for getUserRolePermission
test("Should check if the provided role exists in the first parameter", () => {
  expect(getUserRolePermission([], "formsflow-client")).toBeFalsy();
  expect(
    getUserRolePermission(["formsflow-client"], "formsflow-client")
  ).toBeTruthy();
  expect(
    getUserRolePermission(["formsflow-designer"], "formsflow-client")
  ).toBeFalsy();
  expect(
    getUserRolePermission(
      ["formsflow-designer", "formsflow-client"],
      "formsflow-client"
    )
  ).toBeTruthy();
  expect(getUserRolePermission(["formsflow-reviewer"])).toBeFalsy();
  expect(getUserRolePermission()).toBe(undefined);
});

// test cases for getNameFromEmail
test("should return the name from an email string", () => {
  expect(getNameFromEmail("name@gmail.com")).toBe("name");
  expect(getNameFromEmail("@name@gmail.com")).toBe("@name");
  expect(getNameFromEmail("")).toBe("");
});

// test cases for setShowApplications

test("should check wheather to show submissions or not", () => {
  expect(setShowApplications()).toBeTruthy();
  userAccessGroupCheck.accessAllowApplications = true;
  expect(
    setShowApplications(["/camunda-admin", "/formsflow/formsflow-designer"])
  ).toBeFalsy();
  expect(setShowApplications([])).toBeFalsy();
  expect(
    setShowApplications([
      "/formsflow/formsflow-reviewer/access-allow-applications",
    ])
  ).toBeTruthy();
});



afterAll(() => {
  userAccessGroupCheck.accessAllowApplications = false;
});
