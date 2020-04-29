import BootstrapTable from 'react-bootstrap-table-next';
import { Link } from 'react-router-dom'
import filterFactory, { textFilter,selectFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import React from 'react';
import Nodata from './nodata';

let isTaskAvailable=false;
let total=0;
let idFilter;let titleFilter;let statusFilter;let ownerFilter; let appidFilter; let submittedFilter;let apptypeFilter;
const tasks = [
    { id: 12435, applicationId:53465475, taskTitle: "Form 1", taskStatus: "Assigned",taskOwner:"Vinaya",submittedBy:"Robert",dueDate:"Set due date" ,form:"Membership Form"},
    { id: 346457, applicationId:4565708, taskTitle: "Form 2", taskStatus: "Completed",taskOwner:"Vinaya",submittedBy:"Victor",dueDate:"Set due date" ,form:"Membership Form"},
    { id: 354623, applicationId:7756446, taskTitle: "Form 1", taskStatus: "Completed",taskOwner:"Vinaya",submittedBy:"Berlin",dueDate:"Set due date",form:"Membership Form" },
    { id: 235346, applicationId:2434626, taskTitle: "Form 1", taskStatus: "Assigned",taskOwner:"David",submittedBy:"Jasper",dueDate:"Set due date" ,form:"Membership Form"},
    { id: 144575, applicationId:5674534, taskTitle: "Form 1", taskStatus: "Assign to me",taskOwner:"",submittedBy:"Robert",dueDate:"Set due date" ,form:"Membership Form"},
    { id: 6467, applicationId:53465475, taskTitle: "Form 1", taskStatus: "Assigned",taskOwner:"Vinaya",submittedBy:"Robert",dueDate:"Set due date" ,form:"Membership Form"},
    { id: 6854, applicationId:4565708, taskTitle: "Form 2", taskStatus: "Completed",taskOwner:"Vinaya",submittedBy:"Victor",dueDate:"Set due date" ,form:"Membership Form"},
    { id: 65444, applicationId:7756446, taskTitle: "Form 1", taskStatus: "Completed",taskOwner:"Vinaya",submittedBy:"Berlin",dueDate:"Set due date",form:"Membership Form" },
    { id: 86577, applicationId:2434626, taskTitle: "Form 1", taskStatus: "Assigned",taskOwner:"David",submittedBy:"Jasper",dueDate:"Set due date" ,form:"Membership Form"},
    { id: 45657658, applicationId:5674534, taskTitle: "Form 1", taskStatus: "Assign to me",taskOwner:"",submittedBy:"Robert",dueDate:"Set due date" ,form:"Membership Form"},  
   
];
    if(tasks.length>0)
      {
      isTaskAvailable=true;
      total= tasks.length;
      }
    else
    isTaskAvailable=false;
const selectOptions = [
  { value: 'Assigned', label: 'Assigned' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Assign to me', label: 'Assign to me' }
];
const columns = [{
  dataField: 'id',
  text: 'Task Id',
  formatter:linkSubmisionId,
  className:'task-table-header',
  sort:true,
  filter: textFilter({
    placeholder: "\uf002 Task Id",  // custom the input placeholder
    caseSensitive: false, // default is false, and true will only work when comparator is LIKE
    className:"icon-seach",
    getFilter: (filter) => {
      idFilter = filter;
    }
  })
}, {
  dataField: 'taskTitle',
  text: 'Task Title',
  sort:true,
  filter: textFilter({
    placeholder: '\uf002 Task Title',  // custom the input placeholder
    caseSensitive: false, // default is false, and true will only work when comparator is LIKE
    className:"icon-seach",
    getFilter: (filter) => {
      titleFilter = filter;
    }
  })
}, 
{
    dataField: 'taskOwner',
    text: 'Task Owner',
    sort:true,
    filter: textFilter({
      placeholder: '\uf002 Task Owner',  // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      className:"icon-seach",
      getFilter: (filter) => {
        ownerFilter = filter;
      }
    })
  },
  {
  dataField: 'taskStatus',
  text: 'Task Status',
  sort:true,
  formatter:buttonFormatter,
  filter: selectFilter({
    options: selectOptions,
    placeholder: 'All',
    caseSensitive: false, // default is false, and true will only work when comparator is LIKE
    getFilter: (filter) => {
      statusFilter = filter;
    }
  })
},
{
  dataField: 'applicationId',
  text: 'Application Id',
  sort:true,
  filter: textFilter({
    placeholder: '\uf002 Id',  // custom the input placeholder
    caseSensitive: false, // default is false, and true will only work when comparator is LIKE
    className:"icon-seach",
    getFilter: (filter) => {
      appidFilter = filter;
    }
  })
},
{
  dataField: 'submittedBy',
  text: 'Primary Applicant',
  style: {'whiteSpace': 'nowrap'} ,
  filter: textFilter({
    placeholder: '\uf002 Name',  // custom the input placeholder
    caseSensitive: false, // default is false, and true will only work when comparator is LIKE
    className:"icon-seach",
    getFilter: (filter) => {
      submittedFilter = filter;
    }
  })
},
  {
    dataField: 'form',
    text: 'Application Type',
    filter: textFilter({
      placeholder: '\uf002 Application Type',  // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      className:"icon-seach",
      getFilter: (filter) => {
        apptypeFilter = filter;
      }
    })
  },
  {
    dataField: 'dueDate',
    text: 'Due Date',
    formatter:linkDueDate,
    sort:true,
  },];
  function linkDueDate()
  {
    return  <a href="#">Set due date</a>
  }
  function linkSubmisionId(cell)
  {
    return <Link to='/task/task-detail'>{cell}</Link>  
  }
  
  function buttonFormatter(cell, row){
      if(cell==="Assigned")
      {
        return <label className="text-primary font-weight-bold text-uppercase">{cell}</label>;
      }
      else if(cell==="Completed")
      {
        return <label className="text-success font-weight-bold text-uppercase task-btn">{cell}</label>;
      }
      else if(cell==="Assign to me")
      {
        return <button className="btn btn-outline-primary btn-sm">{cell}</button>;
      }
      
}
const clearFilter = () => {
  idFilter('');
  titleFilter('');
  statusFilter('');
  ownerFilter('');
  appidFilter('');
  submittedFilter('');
  apptypeFilter('');
};
const customTotal = (from, to, size) => 
(
    <span className="react-bootstrap-table-pagination-total">
      Showing { from } to { to } of { size } Results
    </span>
  );
  const options = {
    expandRowBgColor: 'rgb(173,216,230)',
    pageStartIndex: 1,
     alwaysShowAllBtns: true, // Always show next and previous button
     withFirstAndLast: false, // Hide the going to First and Last page button
     hideSizePerPage: true, // Hide the sizePerPage dropdown always
    // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
    paginationSize: 7,  // the pagination bar size.
    prePageText: '<<',
    nextPageText: '>>',
    showTotal: true,
    Total:total,
    paginationTotalRenderer: customTotal,
    disablePageTitle: true,
    sizePerPage:5
  };
  const defaultSortedBy = [{
    dataField: "name",
    order: "asc"  // or desc
}];
// This is my custom search component
const TaskSearch = (props) => {
  let input;
  const statusFilter = () => {
    props.onSearch(input.value);
  };
  return (
    <div>
      <select className="form-control" ref={ n => input = n } onChange={ statusFilter }>
              <option value=" ">All tasks</option>
              <option value="Assigned">Assigned tasks</option>
              <option value="Completed">Completed tasks</option>
            </select>
    </div>
  );
  
};

const TaskList = (props)=>
{
  return ( isTaskAvailable
  ?<ToolkitProvider 
  keyField="id"
  data={ tasks }
  columns={ columns }
  search
>
  {
    props => (
      
        <div className="container"><br></br><div className="row">
        <div className="col-md-1"></div>
        <img src="/clipboard.svg" width="30" height="30" alt="task"></img>
        <h3 className="task-head row">Tasks<div className="col-md-1 task-count row">({total})</div></h3>
        <div className="col-md-2 btn-group">
        <TaskSearch { ...props.searchProps } />
        </div>
        </div>
        <br></br>
      <div className="div-border">
        <BootstrapTable   filter={ filterFactory() } pagination={ paginationFactory(options)} defaultSorted={defaultSortedBy} 
          { ...props.baseProps } noDataIndication={() =>  <div className="div-no-task">
          <label className="lbl-no-task"> No tasks found </label>
          <br></br>
              <label className="lbl-no-task-desc"> Please change the selected filters to view tasks </label>
              <br></br>
              <a href="#" onClick={clearFilter}>Clear all filters</a>
              </div>}
        />
        
        <br />
      </div>
      </div>
    )
  }
</ToolkitProvider>
  :<Nodata/>)
}
export default (TaskList);