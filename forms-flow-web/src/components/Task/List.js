import BootstrapTable from 'react-bootstrap-table-next';
import { Link } from 'react-router-dom'
import filterFactory, { textFilter,selectFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import React from 'react'

const tasks = [
    { id: 12435, applicationId:53465475, taskTitle: "Form 1", taskStatus: "Assigned",taskOwner:"Vinaya",submittedBy:"Robert",dueDate:"Set due date" ,form:"Membership Form"},
    { id: 346457, applicationId:4565708, taskTitle: "Form 2", taskStatus: "Completed",taskOwner:"Vinaya",submittedBy:"Victor",dueDate:"Set due date" ,form:"Membership Form"},
    { id: 354623, applicationId:7756446, taskTitle: "Form 1", taskStatus: "Completed",taskOwner:"Vinaya",submittedBy:"Berlin",dueDate:"Set due date",form:"Membership Form" },
    { id: 235346, applicationId:2434626, taskTitle: "Form 1", taskStatus: "Assigned",taskOwner:"David",submittedBy:"Jasper",dueDate:"Set due date" ,form:"Membership Form"},
    { id: 124355, applicationId:5674534, taskTitle: "Form 1", taskStatus: "Assigned to me",taskOwner:"",submittedBy:"Robert",dueDate:"Set due date" ,form:"Membership Form"}, 
   
];
const selectOptions = [
  { value: 'Assigned', label: 'Assigned' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Assigned to me', label: 'Assigned to me' }
];
const columns = [{
  dataField: 'id',
  text: 'Task Id',
  formatter:linkSubmisionId,
  style: {'width': '10px'} ,
  className:'task-table-header',
  sort:true,
  filter: textFilter({
    placeholder: 'Task Id',  // custom the input placeholder
    caseSensitive: false, // default is false, and true will only work when comparator is LIKE
    
  })
}, {
  dataField: 'taskTitle',
  text: 'Task Title',
  sort:true,
  filter: textFilter({
    placeholder: 'Task Title',  // custom the input placeholder
    caseSensitive: false, // default is false, and true will only work when comparator is LIKE
    
  })
}, 
{
    dataField: 'taskOwner',
    text: 'Task Owner',
    sort:true,
    filter: textFilter({
      placeholder: 'Task Owner',  // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      
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
  })
},
{
  dataField: 'applicationId',
  text: 'Application Id',
  sort:true,
  filter: textFilter({
    placeholder: 'Application Id',  // custom the input placeholder
    caseSensitive: false, // default is false, and true will only work when comparator is LIKE
    
  })
},
{
  dataField: 'submittedBy',
  text: 'Primary Applicant',
  style: {'whiteSpace': 'nowrap'} ,
  filter: textFilter({
    placeholder: 'Primary Applicant',  // custom the input placeholder
    caseSensitive: false, // default is false, and true will only work when comparator is LIKE
    
  })
},
  {
    dataField: 'form',
    text: 'Application Type',
    filter: textFilter({
      placeholder: 'Application Type',  // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      
    })
  },
  {
    dataField: 'dueDate',
    text: 'Due Date',
    formatter:linkDueDate,
    sort:true,
    style: {'whiteSpace': 'nowrap'} 
  },];
  function linkDueDate()
  {
    return  <a href="#"  className="btn-link">Set due date</a>
  }
  function linkSubmisionId(cell)
  {
    return <Link to='/task/task-detail'className="btn-link">{cell}</Link>  
  }
  
  function buttonFormatter(cell, row){
      if(cell==="Assigned")
      {
        return <label className="text-primary font-weight-bold text-uppercase">{cell}</label>;
      }
      else if(cell==="Completed")
      {
        return <label className="text-success font-weight-bold text-uppercase">{cell}</label>;
      }
      else if(cell==="Assigned to me")
      {
        return <button className="btn btn-outline-primary btn-sm">{cell}</button>;
      }
      
}
const customTotal = (from, to, size) => (
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
    paginationTotalRenderer: customTotal,
    disablePageTitle: true,
    sizePerPage:5
  };

  const defaultSortedBy = [{
    dataField: "name",
    order: "asc"  // or desc
}];
export default () => (
    <ToolkitProvider
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
            <h3 className="col-md-2 task-head">Tasks(5)</h3>
            <div className="col-md-2 btn-group">
            <select className="form-control">
              <option>All Tasks</option>
              <option>Assigned Tasks</option>
              <option>Completed Tasks</option>
            </select>
            </div>
            </div>
            <br></br>
          <div>
            <BootstrapTable  filter={ filterFactory() } pagination={ paginationFactory(options)} defaultSorted={defaultSortedBy} 
              { ...props.baseProps } noDataIndication={() => <div className="text-center">No Lists Found</div>}
            />
            
            <br />
          </div>
          </div>
        )
      }
    </ToolkitProvider>
    
);