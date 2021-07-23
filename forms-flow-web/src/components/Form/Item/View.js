import React, {useEffect} from 'react';
import {connect, useDispatch, useSelector} from 'react-redux'
import { selectRoot, resetSubmissions, saveSubmission, Form, selectError, Errors, getForm } from 'react-formio';
import { push } from 'connected-react-router';
import { Link } from 'react-router-dom'

import Loading from '../../../containers/Loading';
import { getProcessReq } from "../../../apiManager/services/bpmServices";
import {
  setFormSubmissionError,
  setFormSubmissionLoading,
  setMaintainBPMFormPagination
} from "../../../actions/formActions";
import SubmissionError from '../../../containers/SubmissionError';
import {applicationCreate} from "../../../apiManager/services/applicationServices";
import LoadingOverlay from "react-loading-overlay";
import {CUSTOM_EVENT_TYPE} from "../../ServiceFlow/constants/customEventTypes";
import {toast} from "react-toastify";

const View = React.memo((props) => {
  const isFormSubmissionLoading = useSelector(state=>state.formDelete.isFormSubmissionLoading);
  const {
      isAuthenticated,
      submission,
      hideComponents,
      onSubmit,
      onCustomEvent,
      errors,
      options,
      form: { form, isActive, url },
      getForm
    } = props;
   const dispatch = useDispatch();

   useEffect(()=>{
    if (!isAuthenticated) {
      getForm();
    }
     dispatch(setMaintainBPMFormPagination(true));
   },[getForm, isAuthenticated, dispatch])

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
{/*          <span className="ml-3">
            <img src="/form.svg" width="30" height="30" alt="form" />
          </span>*/}
          <h3 className="ml-3">
            <span className="task-head-details"><i className="fa fa-wpforms" aria-hidden="true"/> &nbsp; Forms /</span> {form.title}
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
              onCustomEvent={onCustomEvent}
            />
          </div>
        </LoadingOverlay>
      </div>
    );
})

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
              dispatch(setMaintainBPMFormPagination(true));
              /*dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}/edit`))*/
              toast.success("Submission Saved.")
              dispatch(push(`/form`));
            }else{
              dispatch(setFormSubmissionLoading(false));
            }
          } else { //TO DO Update to show error message
            if (IsAuth) {
              dispatch(setFormSubmissionLoading(false));
              dispatch(setMaintainBPMFormPagination(true));
              //dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}/edit`))
              toast.success("Submission Saved.")
              dispatch(push(`/form`));
            }else{
              dispatch(setFormSubmissionLoading(false));
            }
          }
    }));
  }
};

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
          toast.error("Error while Submission.");
          dispatch(setFormSubmissionLoading(false));
          dispatch(setFormSubmissionError(ErrorDetails))
        }
      }));
    },
    onCustomEvent: (customEvent) => {
        switch(customEvent.type){
          case CUSTOM_EVENT_TYPE.CUSTOM_SUBMIT_DONE:
            toast.success("Submission Saved.")
            dispatch(push(`/form`));
            break;
          default: return;
        }
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
