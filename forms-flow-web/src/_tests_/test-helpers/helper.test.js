import {
  replaceUrl,
  addTenankey,
  removeTenantKey,
  checkAndAddTenantKey,
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
      "TENANKEY AND FIRST PART OF VALUE  IS SAME - SECOND PART OF VALUE",
      "tenankey and first part of value  is same "
    )
  ).toBe("tenankey and first part of value  is same - second part of value"); //value is converted into lowercase

  expect(
    addTenankey(
      "tenankey and first part of value  is different - second part of value",
      "different tenankey"
    )
  ).toBe(
    "different tenankey-tenankey and first part of value  is different - second part of value"
  );
});

test("removing tenankey based on value and tenenkey passed", () => {
  expect(
    removeTenantKey(
      "tenankey and first part of value  is same - second part of value",
      "tenankey and first part of value  is same "
    )
  ).toBe(" second part of value"); //returns value itself after removing the first string before the

  expect(
    removeTenantKey(
      "tenankey and first part of value is different - second part of value",
      "different tenankey"
    )
  ).toBe(false);
});

test("adding tenenkey based on value and tenenkey passed", () => {
  expect(
    checkAndAddTenantKey(
      "TENANKEY AND FIRST PART OF VALUE  IS SAME - SECOND PART OF VALUE",
      "tenankey and first part of value  is same "
    )
  ).toBe("TENANKEY AND FIRST PART OF VALUE  IS SAME - SECOND PART OF VALUE");

  expect(
    checkAndAddTenantKey(
      "tenankey and first part of value  is different - second part of value",
      "different tenankey"
    )
  ).toBe(
    "different tenankey-tenankey and first part of value  is different - second part of value"
  );
});
