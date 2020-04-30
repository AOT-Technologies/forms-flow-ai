import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

const Review = (props) => {
    return (
        <div className="review-section">
            <header style={{ display: "inline-flex" }}>
                <p className="text-left">Task Status</p>
                <p className="text-left" style={{ color: "#0a3f73eb", fontSize: "20px", marginLeft: "41px", fontWeight: "bold" }}>ASSIGNED</p>
                &nbsp;
                &nbsp;
                &nbsp;
                <Link to="#" style={{ color: "#015FBB" }}>Unassign</Link>
            </header>
            <section className="review-box">
                <section className="row">
                    <p className="col-md-6" style={{ fontSize: "21px", fontWeight: "bolder" }}>{props.detail.name}</p>
                    <span className="col-md-3"></span>
                    <Link className="col-md-3" to="#">View form</Link>
                </section>
                <section>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                </section>
                <section className="review-status">
                    <label>Review Status</label>
                    <select className="ml-5">
                        <option value="" disabled selected>Set review status</option>
                        <option value="Approve">Approve</option>
                        <option value="Reject">Reject</option>
                        <option value="Send Back">Send Back</option>
                    </select>
                </section>
            </section>
        </div>
    )
}
const mapStateToProps = (state) => {
    return {
        detail: state.tasks.taskDetail
    }
}

export default connect(mapStateToProps)(Review)