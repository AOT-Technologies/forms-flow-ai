import React from "react";
import { Link } from "react-router-dom";
import startCase from "lodash/startCase";
import {
  textFilter,
  selectFilter,
  customFilter,
  FILTER_TYPES,
} from "react-bootstrap-table2-filter";
import { getLocalDateTime } from "../../apiManager/services/formatterService";
import { AWAITING_ACKNOWLEDGEMENT } from "../../constants/applicationConstants";
import { Translation } from "react-i18next";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";

let statusFilter, idFilter, nameFilter, modifiedDateFilter;

export const defaultSortedBy = [
  {
    dataField: "id",
    order: "desc", // or desc
  },
];

const getApplicationStatusOptions = (rows) => {
  const selectOptions = rows.map((option) => {
    return { value: option, label: option };
  });
  return selectOptions;
};

const linkApplication = (cell, row, redirectUrl) => {
  return (
    <Link className="custom_primary_color" to={`${redirectUrl}application/${row.id}`} title={cell}>
      {cell}
    </Link>
  );
};

const linkSubmission = (cell, row, redirectUrl) => {
  const url = row.isClientEdit
    ? `${redirectUrl}form/${row.formId}/submission/${row.submissionId}/edit`
    : `${redirectUrl}form/${row.formId}/submission/${row.submissionId}`;
  const buttonText = row.isClientEdit ? (
    row.applicationStatus === AWAITING_ACKNOWLEDGEMENT ? (
      "Acknowledge"
    ) : (
      <Translation>{(t) => t("Edit")}</Translation>
    )
  ) : (
    <Translation>{(t) => t("View")}</Translation>
  );
  const icon = row.isClientEdit ? "fa fa-edit" : "fa fa-eye";
  return (
    <div onClick={() => window.open(url, "_blank")}>
      <span style={{ color: "blue", cursor: "pointer" }}>
        <span>
          <i className={icon} />
          &nbsp;
        </span>
        {buttonText}
      </span>
    </div>
  );
};

function timeFormatter(cell) {
  const localdate = getLocalDateTime(cell);
  return <label title={cell}>{localdate}</label>;
}

const nameFormatter = (cell) => {
  const name = startCase(cell);
  return (
    <label className="text-truncate w-100" title={name}>
      {startCase(name)}
    </label>
  );
};
const customStyle = { border: "1px solid #ced4da", fontStyle: "normal"};
export const columns_history = [
  {
    dataField: "applicationname",
    text: <Translation>{(t) => t("Application Name")}</Translation>,
    sort: true,
  },
  {
    dataField: "applicationstatus",
    text: <Translation>{(t) => t("Application Status")}</Translation>,
    sort: true,
  },
];

export const columns = (
  applicationStatus,
  lastModified,
  callback,
  t,
  redirectUrl
) => {
  return [
    {
      dataField: "id",
      text: <Translation>{(t) => t("Application Id")}</Translation>,
      formatter: (cell, row) => linkApplication(cell, row, redirectUrl),
      headerClasses: "classApplicationId",
      sort: true,
      filter: textFilter({
        delay: 800,
        placeholder: `\uf002 ${t("Application Id")}`, // custom the input placeholder
        caseSensitive: false, // default is false, and true will only work when comparator is LIKE
        className: "icon-search",
        style: customStyle,
        getFilter: (filter) => {
          idFilter = filter;
        },
      }),
    },
    {
      dataField: "applicationName",
      text: <Translation>{(t) => t("Application Name")}</Translation>,
      sort: true,
      headerClasses: "classApplicationName",
      formatter: nameFormatter,
      filter: textFilter({
        delay: 800,
        placeholder: `\uf002 ${t("Application Name")}`, // custom the input placeholder
        caseSensitive: false, // default is false, and true will only work when comparator is LIKE
        className: "icon-search",
        style: customStyle,
        getFilter: (filter) => {
          nameFilter = filter;
        },
      }),
    },
    {
      dataField: "applicationStatus",
      text: <Translation>{(t) => t("Application Status")}</Translation>,
      sort: true,
      filter:
        applicationStatus?.length > 0 &&
        selectFilter({
          options: getApplicationStatusOptions(applicationStatus),
          style: customStyle,
          placeholder: `${t("All")}`,
          defaultValue: `${t("All")}`,
          caseSensitive: false, // default is false, and true will only work when comparator is LIKE
          getFilter: (filter) => {
            statusFilter = filter;
          },
        }),
    },
    {
      dataField: "formUrl",
      text: <Translation>{(t) => t("Link To Form Submission")}</Translation>,
      formatter: (cell, row) => linkSubmission(cell, row, redirectUrl),
    },

    {
      dataField: "modified",
      text: <Translation>{(t) => t("Last Modified")}</Translation>,
      formatter: timeFormatter,
      sort: true,
      filter: customFilter({
        type: FILTER_TYPES.DATE,
      }),
      // eslint-disable-next-line no-unused-vars
      filterRenderer: (onFilter, column) => {
        return (
          
          <DateRangePicker
            onChange={(selectedRange) => {
              callback(selectedRange);
              onFilter(selectedRange);
            }}
            value={lastModified}
            maxDate={new Date()}
            dayPlaceholder="dd"
            monthPlaceholder="mm"
            yearPlaceholder="yyyy"
            calendarAriaLabel="Select the date"
            dayAriaLabel="Select the day"
            clearAriaLabel="Click to clear"
          />
          
        );
      },
    },
  ];
};

const customTotal = (from, to, size) => (
  <span className="react-bootstrap-table-pagination-total">
    <Translation>{(t) => t("Showing")}</Translation> {from}{" "}
    <Translation>{(t) => t("to")}</Translation> {to}{" "}
    <Translation>{(t) => t("of")}</Translation> {size}{" "}
    <Translation>{(t) => t("Results")}</Translation>
  </span>
);
export const customDropUp = ({ options, currSizePerPage, onSizePerPageChange }) => {
  return (
    <DropdownButton
      drop="up"
      variant="secondary"
      title={currSizePerPage}
      style={{ display: "inline" }}
    >
      {options.map((option) => (
        <Dropdown.Item
          key={option.text}
          type="button"
          onClick={() => onSizePerPageChange(option.page)}
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

export const getoptions = (count, page, countPerPage) => {
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
    Total: count,
    paginationTotalRenderer: customTotal,
    disablePageTitle: true,
    sizePerPage: countPerPage,
    page: page,
    totalSize: count,
    sizePerPageList: getpageList(count),
    sizePerPageRenderer: customDropUp,
  };
};
export const clearFilter = () => {
  statusFilter("");
  idFilter("");
  nameFilter("");
  modifiedDateFilter("");
};
