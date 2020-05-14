import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux'
import { selectRoot, resetSubmissions, saveSubmission, Form, selectError, Errors, getForm } from 'react-formio';
import { push } from 'connected-react-router';
import { Link } from 'react-router-dom'

import Loading from '../../../containers/Loading';
import { triggerNotification, getProcess } from "../../../apiManager/services/bpmServices";
import { setFormSubmissionError } from "../../../actions/formActions";
// import { BPM_USER_DETAILS } from "../../../apiManager/constants/apiConstants";
import PROCESS from "../../../apiManager/constants/processConstants";
import SubmissionError from '../../../containers/SubmissionError';

const View = class extends Component {
  UNSAFE_componentWillMount() {
    if (!this.props.isAuthenticated) {
      this.props.getForm()
    }
  }

  render() {
    const {
      isAuthenticated,
      submission,
      hideComponents,
      onSubmit,
      errors,
      options,
      form: { form, isActive, url }
    } = this.props;
    if (isActive) {
      return <Loading />;
    }
    return (
      <div className="container">
        <div className="main-header">
          <SubmissionError modalOpen={this.props.submissionError.modalOpen}
            message={this.props.submissionError.message}
            onConfirm={this.props.onConfirm}
          >
          </SubmissionError>
          {isAuthenticated ?
            <Link to="/form">
              <img src="/back.svg" alt="back" />
            </Link>
            :
            null
          }
          <span className="ml-3">
            <img src="/form.svg" alt="Forms" />
          </span>
          <h3>
            <span className="task-head-details">Forms /</span> New {form.title}
          </h3>
        </div>
        <Errors errors={errors} />
        <Form
          form={form}
          submission={submission}
          url={url}
          options={{ ...options }}
          hideComponents={hideComponents}
          onSubmit={onSubmit}
        />
      </div>
    );
  }
}

function doProcessActions(submission, ownProps) {
  return (dispatch, getState) => {
    let user = getState().user.userDetail
    let form = getState().form.form
    let IsAuth = getState().user.isAuthenticated
    dispatch(resetSubmissions('submission'));
    const data = getProcess(PROCESS.EmailNotification, form, submission._id, "new", user);
    dispatch(triggerNotification(data),(err,res)=>{
      if(!err){
        if (IsAuth) {
          dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}`))
        }
      }else{ //TO DO Update to show error message
          if (IsAuth) {
            dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}`))
          }
      }
    });
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user.userDetail,
    form: selectRoot('form', state),
    isAuthenticated: state.user.isAuthenticated,
    errors: [
      selectError('form', state),
      selectError('submission', state),
    ],
    options: {
      noAlerts: false,
      i18n: {
        en: {
          error: "Please fix the errors before submitting again.",
        },
      }
    },
    submissionError: selectRoot('formDelete', state).formSubmissionError,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getForm: () => dispatch(getForm('form', ownProps.match.params.formId)),
    onSubmit: (submission) => {
      dispatch(saveSubmission('submission', submission, ownProps.match.params.formId, (err, submission) => {
        if (!err) {
          dispatch(doProcessActions(submission, ownProps))
        }else{
          const ErrorDetails = { modalOpen: true, message: "Submission cannot be done" }
          dispatch(setFormSubmissionError(ErrorDetails))
        }
      }));
    },
    onConfirm: () => {
      const ErrorDetails = { modalOpen: false, message: "" }
      dispatch(setFormSubmissionError(ErrorDetails))
    }
  }
}



export default connect(
  mapStateToProps,
  mapDispatchToProps
)(View)
