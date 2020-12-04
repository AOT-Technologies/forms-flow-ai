import React, {useEffect} from 'react';
import {connect, useSelector} from 'react-redux'
import { selectRoot, resetSubmissions, saveSubmission, Form, selectError, Errors, getForm } from 'react-formio';
import { push } from 'connected-react-router';
import { Link } from 'react-router-dom'

import Loading from '../../../containers/Loading';
import { getProcessReq } from "../../../apiManager/services/bpmServices";
import {setFormSubmissionError, setFormSubmissionLoading} from "../../../actions/formActions";
import SubmissionError from '../../../containers/SubmissionError';
import {applicationCreate} from "../../../apiManager/services/applicationServices";
import LoadingOverlay from "react-loading-overlay";

const View = (props) => {
  const isFormSubmissionLoading = useSelector(state=>state.formDelete.isFormSubmissionLoading);
  const {
      isAuthenticated,
      submission,
      hideComponents,
      onSubmit,
      errors,
      options,
      form: { form, isActive, url },
      getForm
    } = props;

   useEffect(()=>{
    if (!isAuthenticated) {
      getForm();
    }
   },[getForm, isAuthenticated])

    if (isActive) {
      return <Loading />;
    }
    return (
      <div className="container">
        <div className="main-header">
          <SubmissionError modalOpen={props.submissionError.modalOpen}
            message={props.submissionError.message}
            onConfirm={props.onConfirm}
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
            <img src="/form.svg" width="30" height="30" alt="form" />
          </span>
          <h3>
            <span className="task-head-details">Forms /</span> {form.title}
          </h3>
        </div>
        <Errors errors={errors} />
        <LoadingOverlay active={isFormSubmissionLoading} spinner text='Loading...' className="col-12">
          <div className="ml-4 mr-4">
            <Form
              form={form}
              submission={submission}
              url={url}
              options={{ ...options }}
              hideComponents={hideComponents}
              onSubmit={onSubmit}
            />
          </div>
        </LoadingOverlay>
      </div>
    );
}

const doProcessActions = (submission, ownProps) => {
  return (dispatch, getState) => {
    let user = getState().user.userDetail
    let form = getState().form.form
    let IsAuth = getState().user.isAuthenticated
    dispatch(resetSubmissions('submission'));
    const data = getProcessReq(form, submission._id, "new", user);
    dispatch(applicationCreate(data, (err, res) => {
          if (!err) {
            if (IsAuth) {
              dispatch(setFormSubmissionLoading(false));
              dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}`))
            }else{
              dispatch(setFormSubmissionLoading(false));
            }
            console.log("Error")
          } else { //TO DO Update to show error message
            if (IsAuth) {
              dispatch(setFormSubmissionLoading(false));
              dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}`))
            }else{
              dispatch(setFormSubmissionLoading(false));
            }
          }
    }));
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
      dispatch(setFormSubmissionLoading(true));
      dispatch(saveSubmission('submission', submission, ownProps.match.params.formId, (err, submission) => {
        if (!err) {
          dispatch(doProcessActions(submission, ownProps))
        } else {
          const ErrorDetails = { modalOpen: true, message: "Submission cannot be done" }
          dispatch(setFormSubmissionLoading(false));
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
