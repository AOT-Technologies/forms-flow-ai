import React, {useEffect} from 'react';
import {connect, useDispatch, useSelector} from 'react-redux'
import { selectRoot, resetSubmissions, saveSubmission, Form, selectError, Errors } from 'react-formio';
import { push } from 'connected-react-router';
import { formio_resourceBundles } from "../../../../../resourceBundles/formio_resourceBundles";
import Loading from '../../../../../containers/Loading'

import {setFormSubmissionError, setFormSubmissionLoading} from '../../../../../actions/formActions';
import SubmissionError from '../../../../../containers/SubmissionError';
import {getUserRolePermission} from "../../../../../helper/user";
import {CLIENT, MULTITENANCY_ENABLED} from "../../../../../constants/constants";
import {
  CLIENT_EDIT_STATUS,
  UPDATE_EVENT_STATUS,
  getProcessDataReq
} from "../../../../../constants/applicationConstants";
import {useParams} from "react-router-dom";
import {updateApplicationEvent} from "../../../../../apiManager/services/applicationServices";
import LoadingOverlay from "react-loading-overlay";
import {toast} from "react-toastify";
import {Translation,useTranslation } from "react-i18next";

const Edit = React.memo((props) => {
  const {t}=useTranslation();
  const dispatch = useDispatch();
  const lang = useSelector((state) => state.user.lang);
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
  const tenantKey = useSelector(state => state.tenants?.tenantId)
  const redirectUrl  = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : '/'
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
        <LoadingOverlay active={isFormSubmissionLoading} spinner text={t(<Translation>{(t)=>t("Error while Submission.")}</Translation>)} className="col-12">
          <div className="ml-4 mr-4">
        <Form
          form={form}
          submission={submission}
          url={url}
          hideComponents={hideComponents}
          onSubmit={(submission)=>onSubmit(submission,applicationDetail,onFormSubmit,form._id, redirectUrl)}
          options={{ ...options,i18n: formio_resourceBundles,language: lang }}
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
          error:<Translation>{(t)=>t("Please fix the errors before submitting again.")}</Translation>,
        },
      }
    },
    submissionError: selectRoot('formDelete', state).formSubmissionError,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: (submission,applicationDetail, onFormSubmit, formId, redirectUrl) => {
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
                toast.success(<Translation>{(t)=>t("Submission Saved")}</Translation>);
                dispatch(push(`${redirectUrl}form/${ownProps.match.params.formId}/submission/${submission._id}`))
              }
            }));
          }else{
            dispatch(resetSubmissions('submission'));
            dispatch(setFormSubmissionLoading(false));
            if(onFormSubmit){
             onFormSubmit();
            }else{
              toast.success(<Translation>{(t)=>t("Submission Saved")}</Translation>);
              dispatch(push(`${redirectUrl}form/${ownProps.match.params.formId}/submission/${submission._id}/edit`))
            }
          }
        }
        else {
          dispatch(setFormSubmissionLoading(false));
          const ErrorDetails = { modalOpen: true, message: (<Translation>{(t)=>t("Submission cannot be done.")}</Translation>) }
          toast.error(<Translation>{(t)=>t("Error while Submission.")}</Translation>);
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
