import pick from "lodash/pick";
import {
  OPERATIONS,
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
export const INACTIVE = 'inactive';
export const getOperations = (userRoles) => {
  let operations = [];
  if (userRoles.includes('create_submissions')) {
    operations.push(OPERATIONS.insert);
  }
  if (userRoles.includes('view_submissions')) {
    operations.push(OPERATIONS.submission);
  }
  if (userRoles.includes('create_designs')) {
    operations.push(OPERATIONS.viewForm, OPERATIONS.delete); //  OPERATIONS.edit,
  }
  return operations;
};
