import {
  replaceUrl,
  removeTenantKey,
  addTenankey,
} from "../../helper/helper";
import "@testing-library/jest-dom/extend-expect";

test("replace the second param in the first param with the third param ", () => {
  expect(
    replaceUrl("this is a string to replace", "to replace", "after replace")
  ).toBe("this is a string after replace");
});

test("adding tenenkey based on value and tenenkey passed", () => {
  expect(
    addTenankey(
      "path-of-the-form",
      "tenant-test"
    )
  ).toBe("tenant-test-path-of-the-form"); //value is converted into lowercase

});

test("removing tenankey based on value and tenenkey passed", () => {
  expect(
    removeTenantKey(
      "tenant-test-path-of-the-form",
      "tenant-test"
    )
  ).toBe("path-of-the-form"); //returns value itself after removing the first string before the

});

 
