import { Dropdown, DropdownButton } from "react-bootstrap";
import { textFilter } from "react-bootstrap-table2-filter";
import SelectFormForDownload from "../FileUpload/SelectFormForDownload";
import FormOperations from "../FormOperations/FormOperations";
import { Translation} from "react-i18next";

export const defaultSorted = [{
  dataField: 'title',
  order: 'desc'
}];
const customStyle = { border: "1px solid #ced4da", fontStyle: "normal",width:"250px"};
export const designerColums = (t) => [
  {
    dataField: "title",
    text: <Translation>{(t) => t("Forms")}</Translation>,
    sort:true,
    headerClasses: "form_title",
    filter: textFilter({
        delay: 800,
        placeholder: t("Search by form name"), // custom the input placeholder
        style: customStyle,
        caseSensitive: false, // default is false, and true will only work when comparator is LIKE
        className: "icon-search",
      }),
  },
  {
    dataField: "operations",
    text: <Translation>{(t) => t("Operations")}</Translation>,
    headerClasses: "form_operation",
    formatter: (cell, row) => {
      return <FormOperations formData={row} />;
    },
  },
  {
    dataField: "id",
    headerClasses: "form_select",
    text: <SelectFormForDownload type="all" />,
    formatter: (cell, row) => <SelectFormForDownload form={row} />,
  },
];

export const userColumns = (t) => [
  {
    dataField: "title",
    text: "Forms",
    sort:true,
    headerClasses: "form_title",
    filter: textFilter({
        delay: 800,
        placeholder:  t("Search by form name"), // custom the input placeholder
        caseSensitive: false, // default is false, and true will only work when comparator is LIKE
        className: "icon-search"
      }),
  },
  {
    dataField: "operations",
    text: "Operations",
    formatter: (cell, row) => {
      return <FormOperations formData={row} />;
    },
  },
];
const customDropUp = ({ options, currSizePerPage, onSizePerPageChange }) => {
  return (
    <DropdownButton
      drop="down"
      variant="secondary"
      title={currSizePerPage}
      style={{ display: "inline" }}
    >
      {options.map((option) => (
        <Dropdown.Item
          key={option.text}
          type="button"
          onClick={() => {
            onSizePerPageChange(option.page);
          }}
        >
          {option.text}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
};
const getpageList = (count) => {
  const list = [
    {
      text: "5",
      value: 5,
    },
    {
      text: "25",
      value: 25,
    },
    {
      text: "50",
      value: 50,
    },
    {
      text: "100",
      value: 100,
    },
    {
      text: "All",
      value: count,
    },
  ];
  return list;
};

export const getoptions = (pageNo, limit, totalForms) => {
  return {
    expandRowBgColor: "rgb(173,216,230)",
    pageStartIndex: 1,
    alwaysShowAllBtns: true, // Always show next and previous button
    withFirstAndLast: true, // Hide the going to First and Last page button
    hideSizePerPage: false, // Hide the sizePerPage dropdown always
    // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
    paginationSize: 7, // the pagination bar size.
    prePageText: "<",
    nextPageText: ">",
    showTotal: true,
    Total: totalForms,
    disablePageTitle: true,
    sizePerPage: limit,
    page: pageNo,
    totalSize: totalForms,
    sizePerPageList: getpageList(totalForms),
    sizePerPageRenderer: customDropUp,
  };
};
