import pick from "lodash/pick";
import {
  CLIENT,
  OPERATIONS,
  STAFF_DESIGNER,
  STAFF_REVIEWER,
} from "../../../constants/constants";


const columnsToPick = [
  "title",
  "display",
  "type",
  "name",
  "path",
  "tags",
  "components",
];

export const getFormattedForm = (form) => {
  return pick(form, columnsToPick);
};

export const ASCENDING = 'asc';
export const DESCENDING = 'desc';
export const getOperations = (userRoles, showViewSubmissions) => {
  let operations = [];
  if (userRoles.includes(CLIENT) || userRoles.includes(STAFF_REVIEWER)) {
    operations.push(OPERATIONS.insert);
  }
  if (userRoles.includes(STAFF_REVIEWER) && showViewSubmissions) {
    operations.push(OPERATIONS.submission);
  }
  if (userRoles.includes(STAFF_DESIGNER)) {
    operations.push(OPERATIONS.viewForm, OPERATIONS.delete); //  OPERATIONS.edit,
  }
  return operations;
};
