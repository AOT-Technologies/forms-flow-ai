import SelectFormForDownload from "../FileUpload/SelectFormForDownload";
import pick from "lodash/pick";
import {CLIENT, OPERATIONS, STAFF_DESIGNER, STAFF_REVIEWER} from "../../../constants/constants";
import FormSearch from "../FormSearch/FormSearch";


export const designerColumns = [
  {
    key: 'title',
    sort: false,
    title: <FormSearch/>,
    width: 6,
  },
  {
    key: 'operations',
    title: 'Operations',
    width: 5,
  },
  {
    key: 'id',
    title: <SelectFormForDownload type="all"/>,
    width: 1,
    value: (form) => <SelectFormForDownload form={form}/>
  },
]

export const userColumns = [
  {
    key: 'title',
    sort: false,
    title: <FormSearch/>,
    width: 8,
  },
  {
    key: 'operations',
    title: 'Operations',
    width: 4,
  }
];

const columnsToPick = [
  "title",
  "display",
  "type",
  "name",
  "path",
  "tags",
  "components"];

export const getFormattedForm = (form)=>{
  return pick(form,columnsToPick);
}

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
}
