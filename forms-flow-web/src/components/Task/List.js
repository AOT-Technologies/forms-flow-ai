import React, { Component } from 'react'
import { connect } from 'react-redux'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import overlayFactory from 'react-bootstrap-table2-overlay';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import { getUserToken } from '../../apiManager/services/bpmServices';
import { BPM_USER_DETAILS } from '../../apiManager/constants/apiConstants';
import { fetchTaskList, claimTask, unClaimTask } from '../../apiManager/services/taskServices';
import { columns, getoptions, defaultSortedBy, TaskSearch, clearFilter } from './table';
import Loading from '../../containers/Loading';
import Nodata from './nodata';
import { setUpdateLoader } from "../../actions/taskActions";
import moment from 'moment';

const List = class extends Component {
  componentWillMount() {
    //  this.props.getTasks();
  }
  render() {
    const { isLoading, tasks, tasksCount, userDetail, onClaim, onUnclaim, isTaskUpdating } = this.props;
    const listTasks = (tasks) => {
      if (tasks.length > 0) {
        const data= tasks.map(task => {
          return {
            id: task.id,
            applicationId: task.id,//to do update to application/submission id
            taskTitle: task.name,
            taskStatus: task.deleteReason === "completed"?'Completed': task.assignee?"In-Progress":"New",//todo update ,
            taskAssignee: task.assignee,
            submittedBy: "---",
            submissionDate: moment(task.startTime).format("DD-MMM-YYYY HH:mm:ss"),
            dueDate: (task.due || "Set due date"), 
            form: '---',
            userName:userDetail.preferred_username,
            deleteReason:task.deleteReason,
            assignToMeFn:onClaim,
            unAssignFn:onUnclaim
          };
        });
        return data;
      } else {
        return [];
      }
    }
    if (isLoading) {
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
      tasksCount > 0 ?
      <ToolkitProvider keyField="id" data={listTasks(tasks)} columns={columns} search>
        {
          props => (
            <div className="container">
              <div className="main-header">
                <img src="/clipboard.svg" width="30" height="30" alt="task"/>
                <h3 className="task-head">Tasks<div className="col-md-1 task-count">({tasksCount})</div></h3>
                <div className="col-md-2 btn-group">
                  <TaskSearch {...props.searchProps} user={this.props.userDetail.preferred_username} />
                </div>
              </div>
              <br />
              <div>
                <BootstrapTable loading={ isTaskUpdating } filter={filterFactory()} pagination={paginationFactory(getoptions(props.tasksCount))} defaultSorted={defaultSortedBy}
                  {...props.baseProps}  noDataIndication={() => getNoDataIndicationContent()}
                  overlay={ overlayFactory({ spinner: true, styles: { overlay: (base) => ({...base}) } }) }/>
                <br />
              </div>
            </div>
          )
        }
      </ToolkitProvider>
      :
      <Nodata />
    )
  }
}

function doLoaderUpdate(){
  return(dispatch,getState)=>{
    let isLoading = getState().tasks.isTaskUpdating;
    if(isLoading){
      dispatch(fetchTaskList());
      dispatch(setUpdateLoader(false));
    }
  }
}

const mapStateToProps = (state) => {
  return {
    isLoading: state.tasks.isLoading,
    tasks: state.tasks.tasksList,
    tasksCount: state.tasks.tasksCount,
    userDetail: state.user.userDetail,
    isTaskUpdating: state.tasks.isTaskUpdating
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setLoader:dispatch(doLoaderUpdate),
    getTasks:dispatch(
      getUserToken(BPM_USER_DETAILS, (err, res) => {
        if (!err) {
        //  dispatch(getTaskCount());
          dispatch(fetchTaskList((err,res)=>{
            if(!err){
             /* res.map(ele=>{
                return dispatch(
                  getTaskSubmissionDetails(ele.processInstanceId,(err,result)=>{
                     return {...ele, ...result};
                    })
                )
              });
              console.log("res", res);
              dispatch(setTaskList(res))*/
            }
            }))
        }
      })
      ),
    onClaim: (id,userName) => {
    dispatch(setUpdateLoader(true));
      dispatch(getUserToken(BPM_USER_DETAILS, (err, res) => {
        if (!err) {
          dispatch(claimTask(id,userName,(err, res)=>{
            if(!err)
            {
              dispatch(fetchTaskList((err,res)=>{
                if(!err){
                  dispatch(setUpdateLoader(false));
                }
              }));
            }
            else{
              dispatch(setUpdateLoader(false));
            }
          }))
        }
      })
      )
    },
    onUnclaim: (id) => {
      dispatch(setUpdateLoader(true));
      dispatch(getUserToken(BPM_USER_DETAILS, (err, res) => {
        if (!err) {
          dispatch(unClaimTask(id,(err, res)=>{
            if(!err)
            {
              dispatch(fetchTaskList((err,res)=>{
                if(!err){
                  dispatch(setUpdateLoader(false));
                }
              }));
            }
            else{
              dispatch(setUpdateLoader(false));
            }
          }))
        }
      })
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(List);
