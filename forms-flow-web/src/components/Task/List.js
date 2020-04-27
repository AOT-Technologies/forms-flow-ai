import React from 'react'
import { connect } from 'react-redux'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter,selectFilter } from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'

import { getUserToken } from '../../apiManager/services/bpmServices'
import { BPM_USER_DETAILS } from '../../apiManager/constants/apiConstants'
import { fetchTaskList, getTaskCount, claimTask, unClaimTask } from '../../apiManager/services/taskServices'
import { columns, getoptions } from './table'
import Loading from '../../containers/Loading'

// const tasks = [
//     { id: 346457, applicationId:4565708, taskTitle: "Form 2", taskStatus: "Completed",taskOwner:"Vinaya",submittedBy:"Victor",dueDate:"Set due date" ,form:"Membership Form"},
//     { id: 354623, applicationId:7756446, taskTitle: "Form 1", taskStatus: "Completed",taskOwner:"Vinaya",submittedBy:"Berlin",dueDate:"Set due date",form:"Membership Form" },
//     { id: 235346, applicationId:2434626, taskTitle: "Form 1", taskStatus: "Assigned",taskOwner:"David",submittedBy:"Jasper",dueDate:"Set due date" ,form:"Membership Form"},
//     { id: 124355, applicationId:5674534, taskTitle: "Form 1", taskStatus: "Assigned to me",taskOwner:"",submittedBy:"Robert",dueDate:"Set due date" ,form:"Membership Form"}, 
   
// ];
  
//   function buttonFormatter(cell, row){
//       if(cell==="Assigned")
//       {
//         return <label className="text-primary font-weight-bold text-uppercase">{cell}</label>;
//       }
//       else if(cell==="Completed")
//       {
//         return <label className="text-success font-weight-bold text-uppercase">{cell}</label>;
//       }
//       else if(cell==="Assigned to me")
//       {
//         return <button className="btn btn-outline-primary btn-sm">{cell}</button>;
//       }
      
// }
// const customTotal = (from, to, size) => (
//     <span className="react-bootstrap-table-pagination-total">
//       Showing { from } to { to } of { size } Results
//     </span>
//   );
  
  // const options = {
  //   expandRowBgColor: 'rgb(173,216,230)',
  //   pageStartIndex: 1,
  //    alwaysShowAllBtns: true, // Always show next and previous button
  //    withFirstAndLast: false, // Hide the going to First and Last page button
  //    hideSizePerPage: true, // Hide the sizePerPage dropdown always
  //   // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
  //   paginationSize: 7,  // the pagination bar size.
  //   prePageText: '<<',
  //   nextPageText: '>>',
  //   showTotal: true,
  //   paginationTotalRenderer: customTotal,
  //   disablePageTitle: true,
  //   sizePerPage:5
  // };

  const defaultSortedBy = [{
    dataField: "name",
    order: "asc"  // or desc
}];


const listTasks = (props) => {
  let data = [];
  if (props.tasks.length > 0) {
    props.tasks.map(task=>{
      data.push({
        id: task.id,
        applicationId:53465475,
        taskTitle: task.taskDefinitionKey,
        taskStatus: "Assigned",
        taskOwner:(task.owner||"---"),
        submittedBy:task.assignee,
        dueDate:"Set due date" ,
        form:task.name
        // taskName: task.name, formName: task.taskDefinitionKey, taskStatus:"Claimed", submitedBy: task.assignee, dueDate: "Set due date", actions: "View"
      })
    })
    return data
  } else {
    return data = []
  }
}

const Tasks = (props) => {
  if(props.isLoading){
    return (
      <Loading />
    );
  }
  return (
    <ToolkitProvider
      keyField="id"
      data={listTasks(props)}
      columns={columns}
      search
    >
      {
        props => (
          <div className="container"><br></br>
          <div className="row">
            <div className="col-md-1"></div>
          <img src="/clipboard.svg" width="30" height="30" alt="task"></img>
          <h3 className="col-md-2 task-head">Tasks({props.tasksCount})</h3>
          <div className="col-md-2 btn-group">
          <select className="form-control">
            <option>All Tasks</option>
            <option>Assigned Tasks</option>
            <option>Completed Tasks</option>
          </select>
          </div>
          </div>
            <div>
            <BootstrapTable filter={ filterFactory() } pagination={paginationFactory(getoptions(props.tasksCount))} defaultSorted={defaultSortedBy}
              {...props.baseProps} noDataIndication={() => <div className="text-center">No Lists Found</div>}
            />
              <br />
            </div>
          </div>
        )
      }
    </ToolkitProvider>
  )
};

const mapStateToProps = (state) => {
  return {
    isLoading:state.tasks.isLoading,
    tasks: state.tasks.tasksList,
    tasksCount:state.tasks.tasksCount
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    getTasks: dispatch(
      getUserToken(BPM_USER_DETAILS, (err, res) => {
        if (!err) {
          dispatch(fetchTaskList())
          dispatch(getTaskCount())
        }
      })
    ),
    onClaim:(id)=>{
      dispatch(getUserToken(BPM_USER_DETAILS, (err, res) => {
        if (!err) {
          dispatch(claimTask(id))
        }
      })
      )
    },
    onUnclaim:(id)=>{
      dispatch(getUserToken(BPM_USER_DETAILS, (err, res) => {
        if (!err) {
          dispatch(unClaimTask(id))
        }
      })
      )
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tasks);