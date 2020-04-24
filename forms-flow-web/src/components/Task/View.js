import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Tabs, Tab } from 'react-bootstrap'
import { connect } from 'react-redux'
import { selectRoot, Form, selectError } from 'react-formio';
import { push } from 'connected-react-router';

import Details from './Details'

class View extends Component {
    render() {
        // const {
        //     options,
        //     form: { form },
        //     submission: { submission }
        // } = this.props;
        return (
            <div className="container">
                <br></br>
                <div className="row">
                    <Link to="/task">
                        <img src="/back.svg" alt="back" />
                    </Link>
                    <span className="ml-3">
                        <img src="/clipboards.svg" alt="Task" />
                    </span>
                    <h3 className="ml-3 mt-2">
                        <span>Tasks / Verify Member (536673)</span>
                    </h3>
                </div>
                <br />
                <Tabs defaultActiveKey="details">
                    <Tab eventKey="details" title="Details" id="details">
                        <Details />
                    </Tab>
                    <Tab eventKey="form" title="Form" id="form">
                        <div className="row mt-4">
                            <h4 className="col-md-8">Membership Form</h4>
                            <span className="col-md-4">
                                <button className="btn pull-right" style={{ color: "#003366", border: "1px solid #036" }}>
                                    <i class="fa fa-print" aria-hidden="true"></i> Print as PDF
                                </button>
                            </span>

                           
                            {/* <Form
                                form={form}
                                submission={submission}
                                options={{ ...options }}
                            /> */}
                        </div>
                        <section className="row" style={{ display: "block" }}>
                            <p className="col-md-12" style={{ textAlign: "end" }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                            <span className="btn-wrapper pull-right">
                                <button className="btn" style={{ border: "1px solid #D9534F", backgroundColor: "#CB2E25" }}>Reject</button>
                                <button className="btn" style={{ backgroundColor: "#43893E" }}>Approve</button>
                            </span>
                        </section>
                    </Tab>
                    <Tab eventKey="history" title="History" disabled>
                        <h1>History</h1>
                    </Tab>
                </Tabs>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        // form: selectRoot('form', state),
        // submission: selectRoot('submission', state),
        // options: {
        //     readOnly: true,
        // },
        // errors: [
        //     selectError('submission', state),
        //     selectError('form', state)
        // ],
    }
}
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        // getForm:
        //     dispatch(push(`form/5e9442e5b54a922044bab49b/submission/5ea2d9c0eec4fc0b0c3223a6`))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(View)