import React from 'react'
import { Table } from 'react-bootstrap'
import { connect } from 'react-redux'
import moment from 'moment'

import { BPM_USER_DETAILS } from '../../../apiManager/constants/apiConstants'
import { getUserToken } from '../../../apiManager/services/bpmServices'
import { claimTask, unClaimTask } from '../../../apiManager/services/taskServices'
import { setLoader } from '../../../actions/taskActions'

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
                    <td className="border-0">{task.assignee || "---"}</td>
                </tr>
                <tr>
                    <td className="border-0">Task Status</td>
                    <td className="border-0">:</td>
                    {task.status || task.assignee ?
                        <td className="border-0 d-inline-flex">Assigned
                        {task.assignee === props.userName ?
                                <p className="mb-0 ml-3" onClick={() => props.onUnclaim(task.id)}>
                                    Unassgin
                                </p>
                            : null}
                        </td>
                        :
                        <td className="border-0">
                            {!task.assignee ?
                                <p className="mb-0" onClick={() => props.onClaim(task.id, props.userName)}>
                                    Assign to me
                                </p>
                                : null}
                        </td>
                    }
                </tr>
                <tr>
                    <td className="border-0">Primary Applicant</td>
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
                dispatch(setLoader(true))
                if (!err) {
                    dispatch(claimTask(id, userName))
                }
            })
            )
        },
        onUnclaim: (id) => {
            dispatch(getUserToken(BPM_USER_DETAILS, (err, res) => {
                dispatch(setLoader(true))
                if (!err) {
                    dispatch(unClaimTask(id))
                }
            })
            )
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(View)
