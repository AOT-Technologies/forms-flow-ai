import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'

import { getUserToken } from '../../apiManager/services/bpmServices';
import { BPM_USER_DETAILS } from '../../apiManager/constants/apiConstants';
import { fetchTaskList, getTaskCount, getTaskSubmissionDetails } from '../../apiManager/services/taskServices';
import { setTaskList } from "../../actions/taskActions";
import List from './List';
import ViewTask from './ViewTask';
import './Task.scss';
import { setCurrentPage } from '../../actions/bpmActions';

const Task = () => {
  return (
    <div className="container" id="main">
      <Switch>
        <Route exact path="/task" component={List} />
        <Route path="/task/:id"><ViewTask/></Route>
      </Switch>
    </div>
  )
}

const mapDispatchToProps=(dispatch)=>{
  return{
    setCurrentPage:dispatch(setCurrentPage('task')),
    getTasks:dispatch(fetchTaskList((err, res) => {
            if (!err) {
              //  dispatch(getTaskCount());
            }
          })
    ),
    // getTasks: dispatch(
    //   getUserToken(BPM_USER_DETAILS, (err, res) => {
    //     if (!err) {
    //       dispatch(getTaskCount());
    //       dispatch(fetchTaskList((err, res) => {
    //         if (!err) {
    //           res.map(ele => {
    //             return dispatch(
    //               getTaskSubmissionDetails(ele.processInstanceId, (err, result) => {
    //                 return ele = Object.assign(ele,result);
    //               })
    //             )
    //           })
    //           dispatch(setTaskList(res))
    //         }
    //       }))
    //     }
    //   })
    // ),
  }
}

export default connect(null,mapDispatchToProps)(Task);
