import React from "react";
import { Link } from "react-router-dom";
import startCase from "lodash/startCase";
import { textFilter , selectFilter,customFilter,FILTER_TYPES  } from "react-bootstrap-table2-filter";
import {getLocalDateTime} from "../../apiManager/services/formatterService";
import {AWAITING_ACKNOWLEDGEMENT} from "../../constants/applicationConstants";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'

let statusFilter,
    idFilter,
    nameFilter,
    modifiedDateFilter;

export const defaultSortedBy = [
  {
    dataField: "id",
    order: "desc", // or desc
  }
];

const getApplicationStatusOptions = (rows) => {
  const selectOptions = rows.map(option => {
    return {value:option,label:option}
  })
  return selectOptions;
}

const linkApplication = (cell, row) => {
  return (
    <Link to={`/application/${row.id}`} title={cell}>
      {cell}
    </Link>
  );
}


const linkSubmission = (cell,row) => {
  const url = row.isClientEdit ? `/form/${row.formId}/submission/${row.submissionId}/edit`:`/form/${row.formId}/submission/${row.submissionId}`;
  const buttonText = row.isClientEdit ? (row.applicationStatus===AWAITING_ACKNOWLEDGEMENT?'Acknowledge':'Edit') : 'View'
  const icon=row.isClientEdit? 'fa fa-edit' : 'fa fa-eye';
  return (
  <div onClick={()=> window.open(url, "_blank")}>
        <span className="btn btn-primary btn-sm form-btn"><span><i
          className={icon}/>&nbsp;</span>{buttonText}</span>
  </div>
  );
}


function timeFormatter(cell) {
  const localdate = getLocalDateTime(cell) ;
  return <label title={cell}>{localdate}</label>;
}

const nameFormatter = (cell) => {
  const name= startCase(cell);
  return <label className="text-truncate w-100" title={name}>{startCase(name)}</label>;
}
const cutomStyle = { border: '1px solid #ced4da' , fontStyle:'normal'}
export const columns_history = [
  {
    dataField: "application_name",
    text: "Application Name",
    sort: true,
  },
  {
    dataField: "application_status",
    text: "Application Status",
    sort: true,
  },
];

export const columns  = (applicationStatus,lastModified,callback) => {
  return [
    {
      dataField: "id",
      text: "Application ID",
      formatter: linkApplication,
      headerClasses: 'classApplicationId',
      sort: true,
      filter: textFilter({
        delay:800,
        placeholder: "\uf002 Application ID", // custom the input placeholder
        caseSensitive: false, // default is false, and true will only work when comparator is LIKE
        className: "icon-search",
        style:cutomStyle,
        getFilter: (filter) => {
        idFilter = filter;
        },
      }),
    },
    {
      dataField: "applicationName",
      text: "Application Name",
      sort: true,
      headerClasses: 'classApplicationName',
      formatter: nameFormatter,
      filter: textFilter({
        delay:800,
        placeholder: "\uf002 Application Name", // custom the input placeholder
        caseSensitive: false, // default is false, and true will only work when comparator is LIKE
        className: "icon-search",
        style:cutomStyle,
        getFilter: (filter) => {
          nameFilter = filter;
        },
      }),
    },
    {
      dataField: "applicationStatus",
      text: "Application Status",
      sort: true,
      filter: applicationStatus?.length > 0 && selectFilter({
        options: getApplicationStatusOptions(applicationStatus),
        style:cutomStyle,
        placeholder: "All",
        defaultValue: 'All',
        caseSensitive: false, // default is false, and true will only work when comparator is LIKE
        getFilter: (filter) => {
          statusFilter = filter;
        },
      }),
    },
    {
      dataField: "formUrl",
      text: "Link to Form Submission",
      formatter: linkSubmission,
    },
  
    {
      dataField: "modified",
      text: "Last Modified",
      formatter: timeFormatter,
      sort: true,
      filter: customFilter({
        type: FILTER_TYPES.DATE,  
      }),
      filterRenderer: (onFilter, column) => 
      { 
        return  <DateRangePicker
          onChange={(selectedRange)=>{
            callback(selectedRange)
            onFilter(selectedRange)
          }} 
          value={lastModified}
          maxDate={new Date()}
        />}
    }
  ];
 
}

const customTotal = (from, to, size) => (
  <span className="react-bootstrap-table-pagination-total">
    Showing {from} to {to} of {size} Results
  </span>
);
const customDropUp = ({options,currSizePerPage,onSizePerPageChange})=>{
  return <DropdownButton 
    drop="up"
    variant="secondary"
    title={currSizePerPage}
    style={{display:'inline'}}
  >
  {
    options.map(option => (
      <Dropdown.Item 
        key={ option.text }
        type="button"
        onClick={ () => onSizePerPageChange(option.page) }
      >
        { option.text }
        </Dropdown.Item>
    ))
  }
</DropdownButton>
}
const getpageList = (count)=>{
  
  const list = [ 
        {
        text: '5', value: 5
      },
        {
        text: '25', value: 25
      },
        {
        text: '50', value: 50
      },
        {
        text: '100', value: 100
      },
        {
        text: 'All', value: count
      } ]
  return list
}

export const getoptions = (count,page,countPerPage) => {
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
    page:page,
    totalSize:count,
    sizePerPageList:getpageList(count),
    sizePerPageRenderer:customDropUp 
  };
};
export const clearFilter = () => {
    statusFilter("");
    idFilter("");
    nameFilter("");
    modifiedDateFilter("");
};
