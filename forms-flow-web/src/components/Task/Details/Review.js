import React from 'react'
import { Link } from 'react-router-dom'

const Review = () =>{
    return(
        <div className="review-section">
            <header style={{display:"inline-flex"}}>
                <p className="text-left">Task Status</p>
                <p className="text-left" style={{color: "#0a3f73eb",marginLeft: "41px",fontWeight: "bold"}}>ASSIGNED</p>
            </header>
            <section className="review-box">
                <section className="row">
                    <h5 className="col-md-6">Membership form</h5>
                    <span className="col-md-3"></span>
                    <Link className="col-md-3" to="#">View form</Link>
                </section>
                <section>
                    <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                </section>
                <section className="btn-wrapper">
                    <Link to="#">Set due date</Link>
                    <span>
                    <button className="btn pull-right" style={{backgroundColor:"#43893E"}}>Approve</button>
                    <button className="btn pull-right" style={{border: "1px solid #D9534F", backgroundColor:"#CB2E25"}}>Reject</button>
                    </span>
                </section>
            </section>
        </div>
    )
}
export default Review