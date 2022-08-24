import React, { useCallback, useEffect, useRef, useState } from "react";
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
import {
  getProcessReq,
  getDraftReqFormat,
} from "../../../apiManager/services/bpmServices";
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
import { publicApplicationStatus } from "../../../apiManager/services/applicationServices";
import LoadingOverlay from "react-loading-overlay";
import { CUSTOM_EVENT_TYPE } from "../../ServiceFlow/constants/customEventTypes";
import { toast } from "react-toastify";
import { setFormSubmitted } from "../../../actions/formActions";
import { fetchFormByAlias } from "../../../apiManager/services/bpmFormServices";
import { checkIsObjectId } from "../../../apiManager/services/formatterService";
import {
  draftCreate,
  draftUpdate,
  publicDraftCreate,
  publicDraftUpdate,
} from "../../../apiManager/services/draftService";
import { setPublicStatusLoading } from "../../../actions/applicationActions";
import { postCustomSubmission } from "../../../apiManager/services/FormServices";
import {
  CUSTOM_SUBMISSION_URL,
  CUSTOM_SUBMISSION_ENABLE,
  MULTITENANCY_ENABLED,
  DRAFT_ENABLED,
  DRAFT_POLLING_RATE,
} from "../../../constants/constants";
import useInterval from "../../../customHooks/useInterval";
import selectApplicationCreateAPI from "./apiSelectHelper";
import { getFormProcesses } from "../../../apiManager/services/processServices";
import { setFormStatusLoading } from "../../../actions/processActions";
import isEqual from "lodash/isEqual";

const View = React.memo((props) => {
  const [formStatus, setFormStatus] = useState("");
  const { t } = useTranslation();
  const lang = useSelector((state) => state.user.lang);
  const formStatusLoading = useSelector(
    (state) => state.process?.formStatusLoading
  );
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
  const draftSubmissionId = useSelector(
    (state) => state.draft.draftSubmission?.id
  );
  // Holds the latest data saved by the server
  const lastUpdatedDraft = useSelector((state) => state.draft.lastUpdated);
  const isPublic = !props.isAuthenticated;
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  /**
   * `draftData` is used for keeping the uptodate form entry,
   * this will get updated on every change the form is having.
   */
  const [draftData, setDraftData] = useState({});
  const draftRef = useRef();
  const [isDraftCreated, setIsDraftCreated] = useState(false);

  const { formId } = useParams();
  const [validFormId, setValidFormId] = useState(undefined);

  const [showPublicForm, setShowPublicForm] = useState("checking");
  const [poll, setPoll] = useState(DRAFT_ENABLED);
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
  /*
  Selecting which endpoint to use based on authentication status,
  public endpoint or authenticated endpoint.
  */
  const draftCreateMethod = isAuthenticated ? draftCreate : publicDraftCreate;
  const draftUpdateMethod = isAuthenticated ? draftUpdate : publicDraftUpdate;

  const getPublicForm = useCallback(
    (form_id, isObjectId, formObj) => {
      dispatch(setPublicStatusLoading(true));
      dispatch(
        publicApplicationStatus(form_id, (err) => {
          dispatch(setPublicStatusLoading(false));
          if (!err) {
            if (isPublic) {
              if (isObjectId) {
                dispatch(getForm("form", form_id));
                dispatch(setFormStatusLoading(false));
              } else {
                dispatch(
                  setFormRequestData(
                    "form",
                    form_id,
                    `${Formio.getProjectUrl()}/form/${form_id}`
                  )
                );
                dispatch(setFormSuccessData("form", formObj));
                dispatch(setFormStatusLoading(false));
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
      setValidFormId(formId);
    } else {
      dispatch(
        fetchFormByAlias(formId, async (err, formObj) => {
          if (!err) {
            const form_id = formObj._id;
            getPublicForm(form_id, isObjectId, formObj);
            setValidFormId(form_id);
          } else {
            dispatch(setFormFailureErrorData("form", err));
          }
        })
      );
    }
  }, [formId, dispatch, getPublicForm]);
  /**
   * Compares the current form data and last saved data
   * Draft is updated only if the form is updated from the last saved form data.
   */
  const saveDraft = (payload) => {
    let dataChanged = !isEqual(payload.data, lastUpdatedDraft.data);
    if (draftSubmissionId && isDraftCreated) {
      if (dataChanged) dispatch(draftUpdateMethod(payload, draftSubmissionId));
    }
  };

  /**
   * Will create a draft application when the form is selected for entry.
   */
  useEffect(() => {
    if (validFormId && DRAFT_ENABLED) {
      let payload = getDraftReqFormat(validFormId, draftData?.data);
      dispatch(draftCreateMethod(payload, setIsDraftCreated));
    }
  }, [validFormId]);

  useEffect(() => {
    dispatch(setFormStatusLoading(true));
    dispatch(
      getFormProcesses(formId, (err, data) => {
        if (!err) {
          setFormStatus(data.status);
          dispatch(setFormStatusLoading(false));
        }
      })
    );
  }, []);

  /**
   * We will repeatedly update the current state to draft table
   * on purticular interval
   */
  useInterval(
    () => {
      let payload = getDraftReqFormat(validFormId, { ...draftData?.data });
      saveDraft(payload);
    },
    poll ? DRAFT_POLLING_RATE : null
  );

  /**
   * Save the current state when the component unmounts.
   * Save the data before submission to handle submission failure.
   */
  useEffect(() => {
    return () => {
      let payload = getDraftReqFormat(validFormId, draftRef.current?.data);
      if (poll) saveDraft(payload);
    };
  }, [validFormId, draftSubmissionId, isDraftCreated, poll]);

  useEffect(() => {
    if (isPublic) {
      getFormData();
    } else {
      dispatch(setMaintainBPMFormPagination(true));
      setValidFormId(formId);
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

  if (isActive || isPublicStatusLoading || formStatusLoading) {
    return (
      <div data-testid="loading-view-component">
        <Loading />
      </div>
    );
  }

  if (isFormSubmitted && !isAuthenticated) {
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
          {isPublic || formStatus === "active" ? (
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
              onChange={(data) => {
                setDraftData(data);
                draftRef.current = data;
              }}
              onSubmit={(data) => {
                setPoll(false);
                onSubmit(data, form._id, isPublic);
              }}
              onCustomEvent={(evt) => onCustomEvent(evt, redirectUrl)}
            />
          ) : formStatus === "inactive" || !formStatus ? (
            <span>
              <div
                className="container"
                style={{
                  maxWidth: "900px",
                  margin: "auto",
                  height: "50vh",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <h3>{t("Form not published")}</h3>
                <p>{t("You can't submit this form until it is published")}</p>
              </div>
            </span>
          ) : null}
        </div>
      </LoadingOverlay>
    </div>
  );
});

const executeAuthSideEffects = (dispatch, redirectUrl) => {
  dispatch(setMaintainBPMFormPagination(true));
  dispatch(push(`${redirectUrl}form`));
};

// eslint-disable-next-line no-unused-vars
const doProcessActions = (submission, ownProps) => {
  return (dispatch, getState) => {
    const state = getState();
    let form = state.form.form;
    let isAuth = state.user.isAuthenticated;
    const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : `/`;
    const origin = `${window.location.origin}${redirectUrl}`;

    dispatch(resetSubmissions("submission"));
    const data = getProcessReq(form, submission._id, origin);
    const tenantKey = state.tenants?.tenantId;

    let draft_id = state.draft.draftSubmission?.id;
    let isDraftCreated = draft_id ? true : false;
    const applicationCreateAPI = selectApplicationCreateAPI(
      isAuth,
      isDraftCreated,
      DRAFT_ENABLED
    );

    dispatch(
      // eslint-disable-next-line no-unused-vars
      applicationCreateAPI(data, draft_id ? draft_id : null, (err, res) => {
        dispatch(setFormSubmissionLoading(false));
        if (!err) {
          toast.success(
            <Translation>{(t) => t("Submission Saved")}</Translation>
          );
          dispatch(setFormSubmitted(true));
        } else {
          toast.error(
            <Translation>{(t) => t("Submission Failed.")}</Translation>
          );
        }
        if (isAuth) executeAuthSideEffects(dispatch, redirectUrl);
      })
    );
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
    onSubmit: (submission, formId, isPublic) => {
      dispatch(setFormSubmissionLoading(true));
      // this is callback function for submission
      const callBack = (err, submission) => {
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
      };
      if (CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE) {
        postCustomSubmission(submission, formId, isPublic, callBack);
      } else {
        dispatch(saveSubmission("submission", submission, formId, callBack));
      }
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
