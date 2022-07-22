import React, { useCallback, useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  selectRoot,
  resetSubmissions,
  saveSubmission,
  Form,
  selectError,
  Errors,
  getForm,
  Formio,
} from "react-formio";
import { push } from "connected-react-router";
import { Link, useParams } from "react-router-dom";
import Loading from "../../../containers/Loading";
import { useTranslation, Translation } from "react-i18next";
import { getProcessReq } from "../../../apiManager/services/bpmServices";
import { formio_resourceBundles } from "../../../resourceBundles/formio_resourceBundles";
import {
  setFormFailureErrorData,
  setFormRequestData,
  setFormSubmissionError,
  setFormSubmissionLoading,
  setFormSuccessData,
  setMaintainBPMFormPagination,
} from "../../../actions/formActions";
import SubmissionError from "../../../containers/SubmissionError";
import {
  applicationCreate,
  publicApplicationCreate,
  publicApplicationStatus,
} from "../../../apiManager/services/applicationServices";
import LoadingOverlay from "react-loading-overlay";
import { CUSTOM_EVENT_TYPE } from "../../ServiceFlow/constants/customEventTypes";
import { toast } from "react-toastify";
import { setFormSubmitted } from "../../../actions/formActions";
import { fetchFormByAlias } from "../../../apiManager/services/bpmFormServices";
import { checkIsObjectId } from "../../../apiManager/services/formatterService";
import { setPublicStatusLoading } from "../../../actions/applicationActions";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";

const View = React.memo((props) => {
  const { t } = useTranslation();
  const lang = useSelector((state) => state.user.lang);
  const isFormSubmissionLoading = useSelector(
    (state) => state.formDelete.isFormSubmissionLoading
  );
  const isPublicStatusLoading = useSelector(
    (state) => state.applications.isPublicStatusLoading
  );

  const isFormSubmitted = useSelector(
    (state) => state.formDelete.formSubmitted
  );
  const publicFormStatus = useSelector(
    (state) => state.formDelete.publicFormStatus
  );

  const isPublic = !props.isAuthenticated;
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  const { formId } = useParams();
  const [showPublicForm, setShowPublicForm] = useState("checking");

  const {
    isAuthenticated,
    submission,
    hideComponents,
    onSubmit,
    onCustomEvent,
    errors,
    options,
    form: { form, isActive, url },
  } = props;
  const dispatch = useDispatch();

  const getPublicForm = useCallback(
    (form_id, isObjectId, formObj) => {
      dispatch(setPublicStatusLoading(true));
      dispatch(
        // eslint-disable-next-line no-unused-vars
        publicApplicationStatus(form_id, (err, res) => {
          dispatch(setPublicStatusLoading(false));
          if (!err) {
            if (isPublic) {
              if (isObjectId) {
                dispatch(getForm("form", form_id));
              } else {
                dispatch(
                  setFormRequestData(
                    "form",
                    form_id,
                    `${Formio.getProjectUrl()}/form/${form_id}`
                  )
                );
                dispatch(setFormSuccessData("form", formObj));
              }
            }
          }
        })
      );
    },
    [dispatch, isPublic]
  );

  const getFormData = useCallback(() => {
    const isObjectId = checkIsObjectId(formId);
    if (isObjectId) {
      getPublicForm(formId, isObjectId);
    } else {
      dispatch(
        fetchFormByAlias(formId, async (err, formObj) => {
          if (!err) {
            const form_id = formObj._id;
            getPublicForm(form_id, isObjectId, formObj);
          } else {
            dispatch(setFormFailureErrorData("form", err));
          }
        })
      );
    }
  }, [formId, dispatch, getPublicForm]);

  useEffect(() => {
    if (isPublic) {
      getFormData();
    } else {
      dispatch(setMaintainBPMFormPagination(true));
    }
  }, [isPublic, dispatch, getFormData]);

  useEffect(() => {
    if (publicFormStatus) {
      if (
        publicFormStatus.anonymous === true &&
        publicFormStatus.status === "active"
      ) {
        setShowPublicForm(true);
      } else {
        setShowPublicForm(false);
      }
    }
  }, [publicFormStatus]);

  if (isActive || isPublicStatusLoading) {
    return (
      <div data-testid="loading-view-component">
        <Loading />
      </div>
    );
  }

  if (isFormSubmitted) {
    return (
      <div className="text-center pt-5">
        <h1>{t("Thank you for your response.")}</h1>
        <p>{t("saved successfully")}</p>
      </div>
    );
  }

  if (isPublic && !showPublicForm) {
    return (
      <div className="alert alert-danger mt-4" role="alert">
        Form not available
      </div>
    );
  }

  return (
    <div className="container overflow-y-auto">
      <div className="main-header">
        <SubmissionError
          modalOpen={props.submissionError.modalOpen}
          message={props.submissionError.message}
          onConfirm={props.onConfirm}
        ></SubmissionError>
        {isAuthenticated ? (
          <Link title="go back" to={`${redirectUrl}form`}>
            <i className="fa fa-chevron-left fa-lg" />
          </Link>
        ) : null}

        {form.title ? (
          <h3 className="ml-3">
            <span className="task-head-details">
              <i className="fa fa-wpforms" aria-hidden="true" /> &nbsp; Forms /
            </span>{" "}
            {form.title}
          </h3>
        ) : (
          ""
        )}
      </div>
      <Errors errors={errors} />
      <LoadingOverlay
        active={isFormSubmissionLoading}
        spinner
        text={<Translation>{(t) => t("Loading...")}</Translation>}
        className="col-12"
      >
        <div className="ml-4 mr-4">
          <Form
            form={form}
            submission={submission}
            url={url}
            options={{
              ...options,
              language: lang,
              i18n: formio_resourceBundles,
            }}
            hideComponents={hideComponents}
            onSubmit={(data) => {
              onSubmit(data, form._id);
            }}
            onCustomEvent={(evt) => onCustomEvent(evt, redirectUrl)}
          />
        </div>
      </LoadingOverlay>
    </div>
  );
});

// eslint-disable-next-line no-unused-vars
const doProcessActions = (submission, ownProps) => {
  return (dispatch, getState) => {
    let user = getState().user.userDetail;
    let form = getState().form.form;
    let IsAuth = getState().user.isAuthenticated;
    dispatch(resetSubmissions("submission"));
    const data = getProcessReq(form, submission._id, "new", user);
    const tenantKey = getState().tenants?.tenantId;
    const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : `/`;

    if (!IsAuth) {
      // this is for anonymous
      dispatch(
        // eslint-disable-next-line no-unused-vars
        publicApplicationCreate(data, (err, res) => {
          if (!err) {
            dispatch(setFormSubmissionLoading(false));
            toast.success(
              <Translation>{(t) => t("Submission Saved")}</Translation>
            );
            dispatch(setFormSubmitted(true));
          } else {
            //TO DO Update to show error message
            dispatch(setFormSubmissionLoading(false));
            toast.error(
              <Translation>{(t) => t("Submission Failed.")}</Translation>
            );
            // dispatch(setFormSubmitted())
            // dispatch(push(`/public/submitted`));
          }
        })
      );
    } else {
      dispatch(
        // eslint-disable-next-line no-unused-vars
        applicationCreate(data, (err, res) => {
          if (!err) {
            if (IsAuth) {
              dispatch(setFormSubmissionLoading(false));
              dispatch(setMaintainBPMFormPagination(true));
              /*dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}/edit`))*/
              toast.success(
                <Translation>{(t) => t("Submission Saved")}</Translation>
              );
              dispatch(push(`${redirectUrl}form`));
            } else {
              dispatch(setFormSubmissionLoading(false));
            }
          } else {
            //TO DO Update to show error message
            if (IsAuth) {
              dispatch(setFormSubmissionLoading(false));
              dispatch(setMaintainBPMFormPagination(true));
              //dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}/edit`))
              toast.success(
                <Translation>{(t) => t("Submission Saved")}</Translation>
              );
              dispatch(push(`${redirectUrl}form`));
            } else {
              dispatch(setFormSubmissionLoading(false));
            }
          }
        })
      );
    }
  };
};

const mapStateToProps = (state) => {
  return {
    user: state.user.userDetail,
    tenant: state?.tenants?.tenantId,
    form: selectRoot("form", state),
    isAuthenticated: state.user.isAuthenticated,
    errors: [selectError("form", state), selectError("submission", state)],
    options: {
      noAlerts: false,
      i18n: {
        en: {
          error: <Translation>{(t) => t("Message")}</Translation>,
        },
      },
    },
    submissionError: selectRoot("formDelete", state).formSubmissionError,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: (submission, formId) => {
      dispatch(setFormSubmissionLoading(true));
      dispatch(
        saveSubmission("submission", submission, formId, (err, submission) => {
          if (!err) {
            dispatch(doProcessActions(submission, ownProps));
          } else {
            const ErrorDetails = {
              modalOpen: true,
              message: (
                <Translation>
                  {(t) => t("Submission cannot be done.")}
                </Translation>
              ),
            };
            toast.error(
              <Translation>{(t) => t("Error while Submission.")}</Translation>
            );
            dispatch(setFormSubmissionLoading(false));
            dispatch(setFormSubmissionError(ErrorDetails));
          }
        })
      );
    },
    onCustomEvent: (customEvent, redirectUrl) => {
      switch (customEvent.type) {
        case CUSTOM_EVENT_TYPE.CUSTOM_SUBMIT_DONE:
          toast.success("Submission Saved.");
          dispatch(push(`${redirectUrl}form`));
          break;
        case CUSTOM_EVENT_TYPE.CANCEL_SUBMISSION:
          dispatch(push(`${redirectUrl}form`));
          break;
        default:
          return;
      }
    },
    onConfirm: () => {
      const ErrorDetails = { modalOpen: false, message: "" };
      dispatch(setFormSubmissionError(ErrorDetails));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(View);
