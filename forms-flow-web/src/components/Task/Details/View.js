import React from 'react'
import { Table } from 'react-bootstrap'
import { connect } from 'react-redux'
import moment from 'moment'

import { BPM_USER_DETAILS } from '../../../apiManager/constants/apiConstants'
import { getUserToken } from '../../../apiManager/services/bpmServices'
import {claimTask, getTaskDetail, unClaimTask} from '../../../apiManager/services/taskServices'
import { setLoader } from '../../../actions/taskActions'

const taskStatus =(task)=>{
    if(task.deleteReason === "completed"){
        return <label className="text-success font-weight-bold text-uppercase task-btn">Completed</label>;
      }else if(task.assignee){
        return <label className="text-secondary font-weight-bold text-uppercase">In Progress</label>
      }else{
        return <label className="text-primary font-weight-bold text-uppercase task-btn">New</label>;
      }
}

const View = (props) => {
    const task = props.detail;
    return (
        <Table responsive >
            <tbody>
                <tr>
                    <td className="border-0">Task Title</td>
                    <td className="border-0">:</td>
                    <td className="border-0">{task.name}</td>
                </tr>
                <tr>
                    <td className="border-0">Task Assignee</td>
                    <td className="border-0">:</td>
                    {task.assignee ?
                        <td className="border-0 d-inline-flex">
                            {task.assignee}
                            {task.assignee === props.userName && props.detail.deleteReason !== "completed" ?
                                <p className="mb-0 ml-3" onClick={() => props.onUnclaim(task.id)}>
                                    Unassign
                                </p>
                                : null}
                        </td>
                        :
                        <td className="border-0">
                            <p className="mb-0" onClick={() => props.onClaim(task.id, props.userName)}>
                                Assign to me
                            </p>
                        </td>
                    }
                </tr>
                <tr>
                    <td className="border-0">Task Status</td>
                    <td className="border-0">:</td>
                    <td className="border-0">{taskStatus(task)}</td>
                </tr>
                <tr>
                  <td className="border-0">Application Id</td>
                  <td className="border-0">:</td>
                  <td className="border-0">{task.id}</td>{/*TODO update*/}
                </tr>
                <tr>
                    <td className="border-0">Applicant</td>
                    <td className="border-0">:</td>
                    <td className="border-0">---</td>
                </tr>
                <tr>
                    <td className="border-0">Submitted On</td>
                    <td className="border-0">:</td>
                    <td className="border-0">{moment(task.created).format('DD-MMM-YYYY')}</td>
                </tr>
                <tr>
                    <td className="border-0">Due date</td>
                    <td className="border-0">:</td>
                    <td className="border-0">{(task.due ? moment(task.due).format('DD-MMM-YYYY') : <p className="mb-0">Set due date</p>)}</td>
                </tr>
            </tbody>
        </Table>
    )
}

const mapStateToProps = (state) => {
    return {
        detail: state.tasks.taskDetail,
        userName: state.user.userDetail.preferred_username
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        onClaim: (id, userName) => {
            dispatch(getUserToken(BPM_USER_DETAILS, (err, res) => {
                if (!err) {
                  dispatch(setLoader(true));
                  dispatch(claimTask(id,userName,(err, res)=>{
                    if(!err)
                      dispatch(getTaskDetail(id))
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
                      dispatch(getTaskDetail(id));
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

export default connect(mapStateToProps, mapDispatchToProps)(View)
