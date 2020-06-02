import React, { Component } from 'react'
import { connect } from 'react-redux'

import { BPM_USER_DETAILS } from '../../../apiManager/constants/apiConstants'
import { getUserToken } from '../../../apiManager/services/bpmServices'
import { completeTask } from '../../../apiManager/services/taskServices'
import { setUpdateLoader, setTaskSubmissionDetail } from '../../../actions/taskActions'
import { getTaskDetail, getTaskSubmissionDetails } from '../../../apiManager/services/taskServices'
import { setFormSubmissionError } from '../../../actions/formActions'
import SubmissionError from '../../../containers/SubmissionError'

class Review extends Component {
  constructor(props) {
    super();
    this.state = {
      status: props.detail.action || " "
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.detail.action !== this.state.status) {
      this.setState({ status: nextProps.detail.action });
    }
  }

  handleChange = (event) => {
    this.setState({ status: event.target.value })
  }

  render() {
    return (
      <div className="review-section">
        <section className="review-box">
          <SubmissionError modalOpen={this.props.submissionError.modalOpen}
            message={this.props.submissionError.message}
            onConfirm={this.props.onConfirm}
          >
          </SubmissionError>
          <section className="row">
            <p className="col-md-6" style={{ fontSize: "21px", fontWeight: "bolder" }}>{this.props.detail.name}</p>
          </section>
          {/* <section>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tem por incididunt ut labore et dolore magna aliqua.
                        </p>
                    </section> */}
          <div className="review-status">
            <div className="row col-md-12">
              <div className="col-md-4"><label>Review Status</label></div>
              <div className="col-md-6">
                <select value={this.state.status} onChange={(e) => this.handleChange(e)}
                  disabled={(this.props.detail.assignee === null) || (!(this.props.detail.assignee === this.props.userName && this.props.detail.deleteReason !== "completed"))}>
                  <option value=" " disabled>Set review status</option>
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                  <option value="sendback">Send Back</option>
                </select>
              </div>
              <div className="col-md-2">
                {(this.props.detail.assignee && this.props.detail.assignee === this.props.userName && this.props.detail.deleteReason !== "completed") ?

                  <button
                    className="btn btn-primary"
                    disabled={this.state.status === " "}
                    onClick={() => this.props.onCompleteTask(this.props.detail.id, this.state.status)}
                  >Submit</button>
                  : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    detail: state.tasks.taskDetail,
    userName: state.user.userDetail.preferred_username,
    submissionError: state.formDelete.formSubmissionError
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    onCompleteTask: (id, status) => {
      dispatch(getUserToken(BPM_USER_DETAILS, (err, res) => {
        if (!err) {
          dispatch(setUpdateLoader(true));
          dispatch(completeTask(id, status, (err, response) => {
            if (err) {
              dispatch(setUpdateLoader(false));
              const ErrorDetails = { modalOpen: true, message: "Unable to perform the action" }
              dispatch(setFormSubmissionError(ErrorDetails))
            }else{
              dispatch(getTaskDetail(id, (err, res) => {
                if (!err) {
                  dispatch(getTaskSubmissionDetails(res.processInstanceId, (err, res) => {
                    if (!err) {
                      dispatch(setTaskSubmissionDetail(res));
                      dispatch(setUpdateLoader(false));
                    }
                  }))
                }
              }))
            }
          }))
        }
      })
      )
    },
    onConfirm: () => {
      const ErrorDetails = { modalOpen: false, message: "" }
      dispatch(setFormSubmissionError(ErrorDetails))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Review)
