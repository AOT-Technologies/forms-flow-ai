import React, { Component } from 'react'
import { connect } from 'react-redux'

import { BPM_USER_DETAILS } from '../../../apiManager/constants/apiConstants'
import { getUserToken } from '../../../apiManager/services/bpmServices'
import { completeTask } from '../../../apiManager/services/taskServices'

class Review extends Component {
    constructor() {
        super()
        this.state = {
            status: " "
        }
    }
    handleChange = (event) => {
        this.setState({ status: event.target.value })
    }

    render() {
        return (
            <div className="review-section">
                <section className="review-box">
                    <section className="row">
                        <p className="col-md-6" style={{ fontSize: "21px", fontWeight: "bolder" }}>{this.props.detail.name}</p>
                    </section>{/*
                    <section>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tem por incididunt ut labore et dolore magna aliqua.
                        </p>
                    </section>*/}
                    <section className="review-status">
                        <label>Review Status</label>
                        <select className="ml-5" defaultValue={this.state.status} onChange={(e) => this.handleChange(e)}
                            disabled={(this.props.detail.assignee === null) || (this.props.detail.assignee === this.props.userName ? false : true)}>
                            <option value=" " disabled>Set review status</option>
                            <option value="approve">Approve</option>
                            <option value="reject">Reject</option>
                            <option value="sendback">Send Back</option>
                        </select>

                        {(this.props.detail.assignee && this.props.detail.assignee === this.props.userName && this.props.detail.deleteReason !== "completed") ?
                            <button
                                className="btn btn-primary pull-right"
                                disabled={this.state.status === " "}
                                onClick={() => this.props.onCompleteTask(this.props.detail.id, this.state.status)}
                            >Submit</button>
                            : null}
                    </section>
                </section>
            </div>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        detail: state.tasks.taskDetail,
        userName: state.user.userDetail.preferred_username
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        onCompleteTask: (id, status) => {
            dispatch(getUserToken(BPM_USER_DETAILS, (err, res) => {
                if (!err) {
                    dispatch(completeTask(id, status))
                }
            })
            )
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Review)
