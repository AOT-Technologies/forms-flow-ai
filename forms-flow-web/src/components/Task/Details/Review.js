import React, { Component } from 'react'
import { connect } from 'react-redux'

import { completeTask } from '../../../apiManager/services/taskServices'

class Review extends Component {
    constructor(){
        super()
        this.state={
            status:" "
        }
    }
    handleChange=(event)=>{
        this.setState({status:event.target.value})
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
                        <select className="ml-5" defaultValue={this.state.status} onChange={(e)=>this.handleChange(e)}
                        disabled={(this.props.detail.assignee === this.props.userName ? false : true)}>
                            <option value=" " disabled>Set review status</option>
                            <option value="approve">Approve</option>
                            <option value="reject">Reject</option>
                            <option value="sendback">Send Back</option>
                        </select>
                        <br />
                      {this.props.detail.assignee === this.props.userName ? <button className="btn btn-primary pull-right"
                                onClick={() => completeTask(this.props.detail.id,this.state.status)}>Submit</button>:null}
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

export default connect(mapStateToProps)(Review)
