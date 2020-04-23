import React from 'react'
import { connect } from 'react-redux'
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import { Dropdown } from 'react-bootstrap';

import { getUserToken } from '../../apiManager/services/bpmServices'
import { BPM_USER_DETAILS } from '../../apiManager/constants/apiConstants'
import { fetchTaskList, getTaskCount, claimTask, unClaimTask } from '../../apiManager/services/taskServices'
import { columns, getoptions } from './table'
import Loading from '../../containers/Loading'

const { SearchBar } = Search;

const listTasks = (props) => {
  let data = [];
  if (props.tasks.length > 0) {
    props.tasks.map(task=>{
      data.push({
        taskName: task.name, formName: task.taskDefinitionKey, taskStatus:"Claimed", submitedBy: task.assignee, dueDate: "Set due date", actions: "View"
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
          <div className="container"><br></br><div className="row"><h3 className="col-md-6">Tasks</h3>
            <div className="col-md-6 btn-group">
              <SearchBar {...props.searchProps} />
            </div>
          </div>
            <div>
            <BootstrapTable bordered={false} pagination={paginationFactory(getoptions(props.tasksCount))}
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
      console.log("Claim")
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