import React, { useCallback, useEffect, useRef, useState } from "react";
import { push } from "connected-react-router";
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
} from "@aot-technologies/formio-react";
import { useTranslation, Translation } from "react-i18next";
import isEqual from "lodash/isEqual";

import Loading from "../../../containers/Loading";
import {
  getProcessReq,
  getDraftReqFormat,
} from "../../../apiManager/services/bpmServices";
import { RESOURCE_BUNDLES_DATA } from "../../../resourceBundles/i18n";
import {
  setFormFailureErrorData,
  setFormRequestData,
  setFormSubmissionError,
  setFormSubmissionLoading,
  setFormSuccessData,
  setMaintainBPMFormPagination,
  setFormSubmitted,
} from "../../../actions/formActions";
import SubmissionError from "../../../containers/SubmissionError";
import { publicApplicationStatus } from "../../../apiManager/services/applicationServices";
import LoadingOverlay from "react-loading-overlay-ts";
import { CUSTOM_EVENT_TYPE } from "../../../components/ServiceFlow/constants/customEventTypes";
import { toast } from "react-toastify";
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
import selectApplicationCreateAPI from "../../../components/Form/constants/apiSelectHelper";
import {
  getApplicationCount,
  getFormProcesses,
} from "../../../apiManager/services/processServices";
import { setFormStatusLoading } from "../../../actions/processActions";
import { renderPage, textTruncate } from "../../../helper/helper";
import PropTypes from "prop-types";
import { Card } from "react-bootstrap";
import { BackToPrevIcon } from "@formsflow/components";
import { navigateToFormEntries } from "../../../helper/routerHelper";
import { cloneDeep } from "lodash";
import { HelperServices } from "@formsflow/service";
import { useParams } from "react-router-dom";

const View = React.memo((props) => {
  const [formStatus, setFormStatus] = React.useState("");
  const { t } = useTranslation();

  const parentFormId = useSelector(
    (state) => state.form.form?.parentFormId
  );
  const { formId } = useParams();
  const lang = useSelector((state) => state.user.lang);
  const pubSub = useSelector((state) => state.pubSub);
  const isPublic = !props.isAuthenticated;
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const draftSubmission = useSelector((state) => state.draft.draftSubmission || {});
  const draftId = draftSubmission?.id;

  const {
    isFormSubmissionLoading,
    formSubmitted: isFormSubmitted,
    publicFormStatus,
  } = useSelector((state) => state.formDelete) || {};

  const draftSubmissionId = draftSubmission?.applicationId || draftId;
  //modified date
  const draftModified = useSelector((state) => state.draft.draftModified?.modified);

  // Holds the latest data saved by the server
  const { formStatusLoading, processLoadError } =
    useSelector((state) => state.process) || {};

  const isPublicStatusLoading = useSelector(
    (state) => state.applications.isPublicStatusLoading
  );

  /**
   * `draftData` is used for keeping the uptodate form entry,
   * this will get updated on every change the form is having.
   */

  const isDraftEdit = Boolean(draftId);
  const [draftData, setDraftData] = useState(
    isDraftEdit ? cloneDeep(draftSubmission?.data) : {}
  );
  // deeply clone the draft data to avoid mutating the original object
  const formRef = useRef(isDraftEdit ? { data: cloneDeep(draftSubmission?.data) } : {});
  const [isDraftCreated, setIsDraftCreated] = useState(isDraftEdit);
  const [validFormId, setValidFormId] = useState(undefined);

  const [showPublicForm, setShowPublicForm] = useState("checking");
  const [poll, setPoll] = useState(DRAFT_ENABLED);
  const exitType = useRef("UNMOUNT");

  const {
    isAuthenticated,
    submission,
    onSubmit,
    onCustomEvent,
    errors,
    options,
    form: { form, isActive, url, error },
  } = props;

  const [isValidResource, setIsValidResource] = useState(false);

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
  const saveDraft = (payload, exitType) => {
    if (exitType === "SUBMIT") return;
    let dataChanged = !isEqual(payload?.data, draftSubmission?.data);
    if (draftSubmissionId && isDraftCreated) {
      if (dataChanged) {
        dispatch(
          draftUpdateMethod(payload, draftSubmissionId, (err) => {
            if (exitType === "UNMOUNT" && !err && isAuthenticated) {
              toast.success(t("Submission saved to draft."));
            }
          })
        );
      }
    }
  };

  useEffect(() => {
    if (form._id && !error) setIsValidResource(true);
    return () => setIsValidResource(false);
  }, [error, form._id]);

  /**
   * Will create a draft application when the form is selected for entry.
   */
  useEffect(() => {
    if (
      validFormId &&
      DRAFT_ENABLED &&
      isValidResource &&
      !isDraftEdit &&
      ((isAuthenticated && formStatus === "active") ||
        (!isAuthenticated && publicFormStatus?.status == "active"))
    ) {
      let payload = getDraftReqFormat(validFormId, draftData?.data);
      dispatch(draftCreateMethod(payload, setIsDraftCreated));
    }
  }, [validFormId, formStatus, publicFormStatus, isValidResource]);

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
      let payload = getDraftReqFormat(validFormId, formRef.current?.data);
      if (poll) saveDraft(payload, exitType.current);
    };
  }, [validFormId, draftSubmissionId, poll, isDraftCreated, exitType.current]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(setFormStatusLoading(true));
      dispatch(
        getFormProcesses(formId, (err, data) => {
          if (!err) {
            dispatch(getApplicationCount(data.id));
            setFormStatus(data.status);
            dispatch(setFormStatusLoading(false));
          } else {
            dispatch(setFormStatusLoading(false));
          }
        })
      );
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isPublic) {
      getFormData();
    } else {
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

  useEffect(() => {
    if (pubSub.publish) {
      pubSub.publish("ES_FORM", form);
    }
  }, [form, pubSub.publish]);

  // will be updated once application/draft listing page is ready
  const handleBack = () => {
    navigateToFormEntries(dispatch, tenantKey, parentFormId || formId);

  };

  const renderModifiedDate = () => {
    if (draftModified && !isPublic) {
      return (
        <>
          <span className="status-draft"></span> {t("Last modified on:")}{" "}
          {HelperServices.getLocalDateAndTime(draftModified)}
        </>
      );
    } else {
      return (
        <>
          <span className="status-new"></span> {t("New Submission")}
        </>
      );
    }
  };

  const renderHeader = () => (
    <Card className="user-form-header">
      <Card.Body>
        <SubmissionError
          modalOpen={props.submissionError.modalOpen}
          message={props.submissionError.message}
          onConfirm={props.onConfirm}
        ></SubmissionError>
        <div className="d-flex justify-content-between align-items-center">
          <div className="icon-title-container">
            {!isPublic && <BackToPrevIcon
              title={t("Back to Form List")}
              data-testid="back-to-form-list"
              onClick={handleBack}
            />}
            <div className="user-form-header-text">
              {textTruncate(100, 97, form.title)}
            </div>
          </div>
          <div className="d-flex align-items-center">
            <span className="form-modified-date me-3">
              {renderModifiedDate()}
            </span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

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
        {t("Form not available")}
      </div>
    );
  }

  return (
    <div className="userform-wrapper">
      {renderHeader()}
      <Errors errors={errors} />
      <LoadingOverlay
        active={isFormSubmissionLoading}
        spinner
        text={<Translation>{(t) => t("Loading...")}</Translation>}
        className="col-12"
      >
        <div className="wizard-tab user-form-container">
          {(isPublic || formStatus === "active") ? (
            <Form
              form={form}
              submission={isDraftEdit ? draftData : submission}
              url={url}
              options={{
                ...options,
                language: lang ?? "en",
                i18n: RESOURCE_BUNDLES_DATA,
                buttonSettings: { showCancel: false },
              }}
              onChange={() => {
                if (formRef.current?.data) {
                  setDraftData({ data: formRef.current?.data });
                }
              }}
              formReady={(e) => formRef.current = e}
              onSubmit={(data) => {
                setPoll(false);
                exitType.current = "SUBMIT";
                onSubmit(data, form._id, draftId, isPublic);
              }}
              onCustomEvent={(evt) => onCustomEvent(evt, redirectUrl)}
            />
          ) : (
            renderPage(formStatus, processLoadError)
          )}
        </div>
      </LoadingOverlay>
    </div>
  );
});

// eslint-disable-next-line no-unused-vars
const doProcessActions = (submission, draftId, ownProps, formId) => {
  return (dispatch, getState) => {
    const state = getState();
    let form = state.form?.form;
    let isAuth = state.user.isAuthenticated;
    const tenantKey = state.tenants?.tenantId;
    const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : `/`;
    const origin = `${window.location.origin}${redirectUrl}`;
    let parentFormId = form?.parentFormId || form?._id; 
    dispatch(resetSubmissions("submission"));
    const data = getProcessReq(form, submission._id, origin, submission?.data);
    const draftIdToUse = draftId || state.draft?.draftSubmission?.applicationId;
    let isDraftCreated = Boolean(draftIdToUse);
    const applicationCreateAPI = selectApplicationCreateAPI(
      isAuth,
      isDraftCreated,
      DRAFT_ENABLED
    );


    dispatch(
      applicationCreateAPI(data, draftIdToUse, (err) => {
        dispatch(setFormSubmissionLoading(false));
        if (!err) {
          toast.success(<Translation>{(t) => t("Submission Saved")}</Translation>);
          dispatch(setFormSubmitted(true));
          if (isAuth) {
            dispatch(setMaintainBPMFormPagination(true));
            navigateToFormEntries(dispatch, tenantKey, parentFormId);
          }
        } else {
          toast.error(<Translation>{(t) => t("Submission Failed.")}</Translation>);
        }
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

View.propTypes = {
  form: PropTypes.object,
  isAuthenticated: PropTypes.bool,
  errors: PropTypes.array,
  options: PropTypes.object,
  submissionError: PropTypes.object,
  onSubmit: PropTypes.func,
  onConfirm: PropTypes.func,
  submission: PropTypes.object,
  onCustomEvent: PropTypes.func,
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: (submission, formId, draftId, isPublic) => {
      dispatch(setFormSubmissionLoading(true));
      // this is callback function for submission
      const callBack = (err, submission) => {
        if (!err) {
          dispatch(doProcessActions(submission, draftId, ownProps, formId));
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
          toast.success(
            <Translation>{(t) => t("Submission Saved")}</Translation>
          );
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
