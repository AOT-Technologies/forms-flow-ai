import React, {useEffect} from 'react';
import {connect, useDispatch, useSelector} from 'react-redux'
import { selectRoot, resetSubmissions, saveSubmission, Form, selectError, Errors } from 'react-formio';
import { push } from 'connected-react-router';

import Loading from '../../../../../containers/Loading'

import {setFormSubmissionError, setFormSubmissionLoading} from '../../../../../actions/formActions';
import SubmissionError from '../../../../../containers/SubmissionError';
import {getUserRolePermission} from "../../../../../helper/user";
import {CLIENT} from "../../../../../constants/constants";
import {
  CLIENT_EDIT_STATUS,
  UPDATE_EVENT_STATUS,
  getProcessDataReq
} from "../../../../../constants/applicationConstants";
import {useParams} from "react-router-dom";
import {updateApplicationEvent} from "../../../../../apiManager/services/applicationServices";
import LoadingOverlay from "react-loading-overlay";
import {toast} from "react-toastify";

const Edit = React.memo((props) => {
  const dispatch = useDispatch();
  const {formId, submissionId} = useParams();
  const {
    hideComponents,
    onSubmit,
    options,
    errors,
    onFormSubmit,
    onCustomEvent,
    form: { form, isActive: isFormActive },
    submission: { submission, isActive: isSubActive, url }
  } = props;

  const applicationStatus = useSelector(state => state.applications.applicationDetail?.applicationStatus || '');
  const userRoles = useSelector((state) => {
    return selectRoot("user", state).roles;
  });
  const applicationDetail = useSelector(state=>state.applications.applicationDetail);
  const isFormSubmissionLoading = useSelector(state=>state.formDelete.isFormSubmissionLoading);
  useEffect(() => {
    if (applicationStatus && !onFormSubmit) {
      if (getUserRolePermission(userRoles, CLIENT) && !CLIENT_EDIT_STATUS.includes(applicationStatus)) {
        dispatch(push(`/form/${formId}/submission/${submissionId}`));
      }
    }
  }, [applicationStatus, userRoles, dispatch, submissionId, formId, onFormSubmit ]);

  if ((isFormActive ||  (isSubActive && !isFormSubmissionLoading))) {
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
          <h3 className="task-head">{form.title}</h3>
        </div>
        <Errors errors={errors} />
        <LoadingOverlay active={isFormSubmissionLoading} spinner text='Loading...' className="col-12">
          <div className="ml-4 mr-4">
        <Form
          form={form}
          submission={submission}
          url={url}
          hideComponents={hideComponents}
          onSubmit={(submission)=>onSubmit(submission,applicationDetail,onFormSubmit,form._id)}
          options={{ ...options }}
          onCustomEvent={onCustomEvent}
        />
          </div>
        </LoadingOverlay>
      </div>
    );
})

Edit.defaultProps = {
  onCustomEvent: ()=>{}
};

const mapStateToProps = (state) => {
  return {
    user: state.user.userDetail,
    form: selectRoot('form', state),
    submission: selectRoot('submission', state),
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
    onSubmit: (submission,applicationDetail, onFormSubmit, formId) => {
      dispatch(setFormSubmissionLoading(true));
      dispatch(saveSubmission('submission', submission, onFormSubmit?formId: ownProps.match.params.formId, (err, submission) => {
        if (!err) {
          if(UPDATE_EVENT_STATUS.includes(applicationDetail.applicationStatus)){
            const data = getProcessDataReq(applicationDetail);
            dispatch(updateApplicationEvent(data,()=>{
              dispatch(resetSubmissions('submission'));
              dispatch(setFormSubmissionLoading(false));
              if(onFormSubmit){
                onFormSubmit();
              }else{
                toast.success("Submission Saved.");
                dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}`))
              }
            }));
          }else{
            dispatch(resetSubmissions('submission'));
            dispatch(setFormSubmissionLoading(false));
            if(onFormSubmit){
             onFormSubmit();
            }else{
              toast.success("Submission Saved.");
              dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}/edit`))
            }
          }
        }
        else {
          dispatch(setFormSubmissionLoading(false));
          const ErrorDetails = { modalOpen: true, message: "Submission cannot be done" }
          toast.error("Error while Submission.");
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
)(Edit)
