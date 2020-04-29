import React from 'react'
import { connect } from 'react-redux'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'

import { getUserToken } from '../../apiManager/services/bpmServices'
import { BPM_USER_DETAILS } from '../../apiManager/constants/apiConstants'
import { fetchTaskList, getTaskCount, claimTask, unClaimTask } from '../../apiManager/services/taskServices'
import { columns, getoptions, defaultSortedBy, TaskSearch, clearFilter } from './table'
import Loading from '../../containers/Loading'
import Nodata from './nodata';

let isTaskAvailable = false;
let total = 0;

const listTasks = (props) => {
  let data = [];
  if (props.tasks.length > 0) {
    props.tasks.map(task => {
      data.push({
        id: task.id,
        applicationId: 53465475,//to do 
        taskTitle: task.taskDefinitionKey,
        taskStatus: "Claimed",//to do 
        taskOwner: (task.owner || "---"),
        submittedBy: (task.assignee || "---"),
        dueDate: (task.due || "Set due date"),
        form: task.name
      })
    })
    return data
  } else {
    return data = []
  }
}
const Tasks = (props) => {
  if (props.tasksCount > 0) {
    isTaskAvailable = true;
    total = props.tasksCount;
  }
  else {
    isTaskAvailable = false;
  }
  if (props.isLoading) {
    return (
      <Loading />
    );
  }
  return (
    isTaskAvailable ?
      <ToolkitProvider keyField="id" data={listTasks(props)} columns={columns} search>
        {
          props => (
            <div className="container"><br></br>
              <div className="row">
                <div className="col-md-1"></div>
                <img src="/clipboard.svg" width="30" height="30" alt="task"></img>
                <h3 className="task-head row">Tasks<div className="col-md-1 task-count row">({total})</div></h3>
                <div className="col-md-2 btn-group">
                  <TaskSearch {...props.searchProps} />
                </div>
              </div>
              <br />
              <div className="div-border">
                <BootstrapTable filter={filterFactory()} pagination={paginationFactory(getoptions(props.tasksCount))} defaultSorted={defaultSortedBy}
                  {...props.baseProps}  noDataIndication={() => <div className="div-no-task">
                    <label className="lbl-no-task"> No tasks found </label>
                    <br></br>
                    <label className="lbl-no-task-desc"> Please change the selected filters to view tasks </label>
                    <br></br>
                    <label className="lbl-clear"  onClick={clearFilter}>Clear all filters</label>
                  </div>}
                />
                <br />
              </div>
            </div>
          )
        }
      </ToolkitProvider>
      :
      <Nodata />
  )
};

const mapStateToProps = (state) => {
  return {
    isLoading: state.tasks.isLoading,
    tasks: state.tasks.tasksList,
    tasksCount: state.tasks.tasksCount
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    getTasks: dispatch(
      getUserToken(BPM_USER_DETAILS, (err, res) => {
        if (!err) {
          dispatch(getTaskCount())
          dispatch(fetchTaskList())
        }
      })
    ),
    onClaim: (id) => {
      dispatch(getUserToken(BPM_USER_DETAILS, (err, res) => {
        if (!err) {
          dispatch(claimTask(id))
        }
      })
      )
    },
    onUnclaim: (id) => {
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