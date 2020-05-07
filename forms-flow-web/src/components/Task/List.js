import React from 'react'
import { connect } from 'react-redux'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'

import { getUserToken } from '../../apiManager/services/bpmServices'
import { BPM_USER_DETAILS } from '../../apiManager/constants/apiConstants'
import { fetchTaskList, getTaskCount, claimTask, unClaimTask, getTaskSubmissionDetails } from '../../apiManager/services/taskServices'
import { columns, getoptions, defaultSortedBy, TaskSearch, clearFilter } from './table'
import Loading from '../../containers/Loading'
import Nodata from './nodata';
import {setLoader} from "../../actions/taskActions";

let isTaskAvailable = false;
let total = 0;

const listTasks = (props) => {
  if (props.tasks.length > 0) {
    const data= props.tasks.map(task => {
      return {
        id: task.id,
        applicationId: task.id,//to do update to application/submission id
        taskTitle: task.name,
        taskStatus: task.deleteReason === "completed"?'Completed': task.assignee?"Assigned":"New",//todo update ,
        taskAssignee: task.assignee,
        submittedBy: "---",
        dueDate: (task.due || "Set due date"),
        form: '---',
        userName:props.userDetail.preferred_username,
        deleteReason:task.deleteReason,
        assignToMeFn:props.onClaim,
        unAssignFn:props.onUnclaim
      };
    });
    return data;
  } else {
    return [];
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
  const getNoDataIndicationContent = () => {
    return (<div className="div-no-task">
      <label className="lbl-no-task"> No tasks found </label>
      <br/>
      <label className="lbl-no-task-desc"> Please change the selected filters to view tasks </label>
      <br/>
      <label className="lbl-clear"  onClick={clearFilter}>Clear all filters</label>
    </div>)
  }
  return (
    isTaskAvailable ?
      <ToolkitProvider keyField="id" data={listTasks(props)} columns={columns} search>
        {
          props => (
            <div className="container">
              <div className="main-header">
                <img src="/clipboard.svg" width="30" height="30" alt="task"/>
                <h3 className="task-head">Tasks<div className="col-md-1 task-count">({total})</div></h3>
                <div className="col-md-2 btn-group">
                  <TaskSearch {...props.searchProps} />
                </div>
              </div>
              <br />
              <div>
                <BootstrapTable filter={filterFactory()} pagination={paginationFactory(getoptions(props.tasksCount))} defaultSorted={defaultSortedBy}
                  {...props.baseProps}  noDataIndication={() => getNoDataIndicationContent()}
                />
                <br />
              </div>
            </div>
          )
        }
      </ToolkitProvider>
      :
      <Nodata />
  );
};

const mapStateToProps = (state) => {
  return {
    isLoading: state.tasks.isLoading,
    tasks: state.tasks.tasksList,
    tasksCount: state.tasks.tasksCount,
    userDetail: state.user.userDetail
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    getTasks: dispatch(
      getUserToken(BPM_USER_DETAILS, (err, res) => {
        if (!err) {
          dispatch(setLoader(true));
          dispatch(getTaskCount())
          dispatch(fetchTaskList((err,res)=>{
            if(!err){
              res.forEach(ele=>{
                dispatch(
                  getTaskSubmissionDetails(ele.processInstanceId,(err,result)=>{
                    for(let i=0;i<res.length;i++){
                      if(res[i].processInstanceId===ele.processInstanceId){
                        //append to the tasklist
                      }
                    }
                })
                )
              })
            }
          }))
        }
      })
    ),
    onClaim: (id,userName) => {
      dispatch(getUserToken(BPM_USER_DETAILS, (err, res) => {
        if (!err) {
          dispatch(setLoader(true));
          dispatch(claimTask(id,userName,(err, res)=>{
            if(!err)
            dispatch(fetchTaskList());
            else{
              dispatch(setLoader(false));
            }
          }))
        }
      })
      )
    },
    onUnclaim: (id) => {
      dispatch(getUserToken(BPM_USER_DETAILS, (err, res) => {
        if (!err) {
          dispatch(setLoader(true));
          dispatch(unClaimTask(id,(err, res)=>{
            if(!err)
              dispatch(fetchTaskList());
            else{
              dispatch(setLoader(false));
            }
          }))
        }
      })
      )
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tasks);
