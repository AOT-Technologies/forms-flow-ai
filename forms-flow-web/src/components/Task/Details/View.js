import React from 'react'
import { Table } from 'react-bootstrap'
import { connect } from 'react-redux'
import moment from 'moment'

const View = (props) => {
    const task = props.detail;
    return (
        <Table responsive >
            <tbody>
                <tr>
                    <td className="border-0">Task Id</td>
                    <td className="border-0">:</td>
                    <td className="border-0">{task.id}</td>
                </tr>
                <tr>
                    <td className="border-0">Task Title</td>
                    <td className="border-0">:</td>
                    <td className="border-0">{task.taskDefinitionKey}</td>
                </tr>
                <tr>
                    <td className="border-0">Task Owner</td>
                    <td className="border-0">:</td>
                    <td className="border-0">{task.owner||"---"}</td>
                </tr>
                <tr>
                    <td className="border-0">Primary Applicant</td>
                    <td className="border-0">:</td>
                    <td className="border-0">{task.assignee||"---"}</td>
                </tr>
                <tr>
                    <td className="border-0">Submitted On</td>
                    <td className="border-0">:</td>
                    <td className="border-0">{moment(task.created).format('DD-MMM-YYYY')}</td>
                </tr>
            </tbody>
        </Table>
    )
}

const mapStateToProps = (state) => {
    return {
        detail: state.tasks.taskDetail
    }
}

export default connect(mapStateToProps)(View)