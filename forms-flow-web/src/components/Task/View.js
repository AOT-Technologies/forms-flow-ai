import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Tabs, Tab } from 'react-bootstrap'
import { connect } from 'react-redux'
import {selectRoot, selectError} from 'react-formio';

import Details from './Details'
import { BPM_USER_DETAILS } from '../../apiManager/constants/apiConstants'
import { getUserToken } from '../../apiManager/services/bpmServices'
import { getTaskDetail, getTaskSubmissionDetails } from '../../apiManager/services/taskServices'

import Loading from '../../containers/Loading'
import {setLoader, setTaskSubmissionDetail} from "../../actions/taskActions";

class View extends Component {
  render() {
        const { detail } = this.props;
        if (this.props.isLoading) {
            return (
                <Loading />
            );
        }
        return (
            <div className="container">
                <div className="main-header">
                    <Link to="/task">
                        <img src="/back.svg" alt="back" />
                    </Link>
                    <span className="ml-3">
                        <img src="/clipboard.svg" alt="Task" />
                    </span>
                    <h3>
                        <span className="task-head-details">Tasks /</span> {`${detail.name}`}
                    </h3>
                </div>
                <br />
                <Tabs id="task-details" defaultActiveKey="details">
                    <Tab eventKey="details" title="Details" id="details">
                        <Details />
                    </Tab>
                    <Tab eventKey="form" title="Form" id="form">
                        <div className="row mt-4">
                            <h4 className="col-md-8">{detail.name}</h4>
                            <span className="col-md-4">
                                <button className="btn pull-right" style={{ color: "#003366", border: "1px solid #036" }}>
                                    <i className="fa fa-print" aria-hidden="true"/> Print as PDF
                                </button>
                            </span>
                            {/* <Form
                                form={form}
                                submission={submission}
                                hideComponents={hideComponents}
                                options={{...options}}
                                /> */}

                        </div>
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
        detail: state.tasks.taskDetail,
        isLoading: state.tasks.isLoading,
        form: selectRoot('form', state),
        submission: selectRoot('submission', state),
        options: {
            readOnly: true,
        },
        errors: [
            selectError('submission', state),
            selectError('form', state)
        ],
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        getTask: dispatch(
            getUserToken(BPM_USER_DETAILS, (err, res) => {
                let id = window.location.pathname.split("/")[2]
                if (!err) {
                  dispatch(setLoader(true));
                  dispatch(getTaskDetail(id,(err,res)=>{
                      if(!err){
                          dispatch(getTaskSubmissionDetails(res.processInstanceId, (err,res)=>{
                            if(!err){
                              dispatch(setTaskSubmissionDetail(res));
                            }
                          }))
                      }
                  }))
                }
            })
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(View)
