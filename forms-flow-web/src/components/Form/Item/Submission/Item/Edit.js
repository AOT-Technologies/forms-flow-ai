import React, {useEffect} from 'react';
import {connect, useDispatch, useSelector} from 'react-redux'
import { selectRoot, resetSubmissions, saveSubmission, Form, selectError, Errors } from 'react-formio';
import { push } from 'connected-react-router';

import Loading from '../../../../../containers/Loading'

import { setFormSubmissionError } from '../../../../../actions/formActions';
import SubmissionError from '../../../../../containers/SubmissionError';
import { setUpdateLoader } from "../../../../../actions/taskActions";
import {getUserRolePermission} from "../../../../../helper/user";
import {CLIENT, STAFF_REVIEWER} from "../../../../../constants/constants";
import {
  CLIENT_EDIT_STATUS,
  UPDATE_EVENT_STATUS,
  getProcessDataReq
} from "../../../../../constants/applicationConstants";
import {useParams} from "react-router-dom";
import {updateApplicationEvent} from "../../../../../apiManager/services/applicationServices";

const Edit = (props) => {
  const dispatch = useDispatch();
  const {formId, submissionId} = useParams();
  const {
    hideComponents,
    onSubmit,
    options,
    errors,
    form: { form, isActive: isFormActive },
    submission: { submission, isActive: isSubActive, url }
  } = props;

  const applicationStatus = useSelector(state => state.applications.applicationDetail?.applicationStatus || '');
  const userRoles = useSelector((state) => {
    return selectRoot("user", state).roles;
  });
  const applicationDetail = useSelector(state=>state.applications.applicationDetail);

  useEffect(() => {
    if (applicationStatus) {
      if (getUserRolePermission(userRoles, STAFF_REVIEWER) && CLIENT_EDIT_STATUS.includes(applicationStatus)) {
        dispatch(push(`/form/${formId}/submission/${submissionId}`));
      } else if (getUserRolePermission(userRoles, CLIENT) && !CLIENT_EDIT_STATUS.includes(applicationStatus)) {
        dispatch(push(`/form/${formId}/submission/${submissionId}`));
      }
    }
  }, [applicationStatus, userRoles, dispatch, submissionId, formId ]);

  if (isFormActive || isSubActive) {
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
        <Form
          form={form}
          submission={submission}
          url={url}
          hideComponents={hideComponents}
          onSubmit={(submission)=>onSubmit(submission,applicationDetail)}
          options={{ ...options }}
        />
      </div>
    );
}

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
    onSubmit: (submission,applicationDetail) => {
      dispatch(saveSubmission('submission', submission, ownProps.match.params.formId, (err, submission) => {
        if (!err) {
          dispatch(setUpdateLoader(true));

          if(UPDATE_EVENT_STATUS.includes(applicationDetail.applicationStatus)){
            const data = getProcessDataReq(applicationDetail);
            dispatch(updateApplicationEvent(data,()=>{
              dispatch(resetSubmissions('submission'));
              dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}`))
            }));
          }else{
            dispatch(resetSubmissions('submission'));
            dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}`))
          }
        }
        else {
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
)(Edit)
