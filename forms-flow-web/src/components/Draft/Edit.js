import React, { useEffect, useRef, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  selectRoot,
  resetSubmissions,
  saveSubmission,
  Form,
  selectError,
  Errors,
} from "react-formio";
import { push } from "connected-react-router";
import { Link, useParams } from "react-router-dom";
import { useTranslation, Translation } from "react-i18next";
import LoadingOverlay from "react-loading-overlay";
import { toast } from "react-toastify";
import isEqual from "lodash/isEqual";

import { formio_resourceBundles } from "../../resourceBundles/formio_resourceBundles";
import useInterval from "../../customHooks/useInterval";
import { CUSTOM_EVENT_TYPE } from "../ServiceFlow/constants/customEventTypes";
import selectApplicationCreateAPI from "../Form/Item/apiSelectHelper";
import {
  clearFormError,
  clearSubmissionError,
  setFormFailureErrorData,
  setFormSubmissionError,
  setFormSubmissionLoading,
  setFormSubmitted,
} from "../../actions/formActions";
import {
  formioPostSubmission,
  postCustomSubmission,
} from "../../apiManager/services/FormServices";
import {
  getProcessReq,
  getDraftReqFormat,
} from "../../apiManager/services/bpmServices";
import {
  deleteDraftbyId,
  draftUpdate,
} from "../../apiManager/services/draftService";
import {
  CUSTOM_SUBMISSION_URL,
  CUSTOM_SUBMISSION_ENABLE,
  MULTITENANCY_ENABLED,
  DRAFT_ENABLED,
  DRAFT_POLLING_RATE,
} from "../../constants/constants";
import Loading from "../../containers/Loading";
import SubmissionError from "../../containers/SubmissionError";
import SavingLoading from "../Loading/SavingLoading";
import Confirm from "../../containers/Confirm";
import { setDraftDelete } from "../../actions/draftActions";
import { setFormStatusLoading } from "../../actions/processActions";
import { getFormProcesses } from "../../apiManager/services/processServices";
import { executeRule } from "../../apiManager/services/bundleServices";
import {
  setBundleSelectedForms,
  setBundleSubmissionData,
  setBundleSubmitLoading,
} from "../../actions/bundleActions";
import BundleSubmit from "../Bundle/item/BundleSubmissionComponent";
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

  const draftDelete = useSelector((state) => state.draft?.draftDelete);

  const isPublic = !props.isAuthenticated;
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const draftSubmission = useSelector((state) => state.draft.submission);
  const [draftSaved, setDraftSaved] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const bundleSubmitLoading = useSelector(
    (state) => state.bundle.bundleSubmitLoading
  );
  /**
   * `draftData` is used for keeping the uptodate form entry,
   * this will get updated on every change the form is having.
   */
  const [draftData, setDraftData] = useState(draftSubmission?.data);
  // Holds the latest data saved by the server
  const lastUpdatedDraft = useSelector((state) => state.draft.lastUpdated);
  const draftRef = useRef();
  const { formId, draftId } = useParams();
  const [poll, setPoll] = useState(DRAFT_ENABLED);
  const exitType = useRef("UNMOUNT");
  const formStatusLoading = useSelector(
    (state) => state.process?.formStatusLoading
  );

  const processData = useSelector((state) => state.process?.formProcessList);
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

  const saveDraft = (payload, exitType = exitType) => {
    if (exitType === "SUBMIT" || processData?.status !== "active") return;
    let dataChanged = !isEqual(payload.data, lastUpdatedDraft.data);
    if (draftSubmission?.id) {
      if (String(draftSubmission?.id) !== String(draftId)) return;
      if (dataChanged) {
        setDraftSaved(false);
        if (!showNotification) setShowNotification(true);
        dispatch(
          draftUpdate(payload, draftSubmission?.id, (err) => {
            if (exitType === "UNMOUNT" && !err) {
              toast.success(t("Submission saved to draft."));
            }
            if (!err) {
              setDraftSaved(true);
            } else {
              setDraftSaved(false);
            }
          })
        );
      }
    }
  };

  /**
   * We will repeatedly update the current state to draft table
   * on purticular interval
   */
  useInterval(
    () => {
      let payload = getDraftReqFormat(formId, { ...draftData });
      saveDraft(payload);
    },
    poll ? DRAFT_POLLING_RATE : null
  );

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(setFormStatusLoading(true));
      dispatch(
        getFormProcesses(formId, (err, res) => {
          dispatch(clearFormError("form"));
          dispatch(clearSubmissionError("submission"));
          if (res.formType === "bundle") {
            executeRule(draftSubmission.data, res.id)
              .then((bundleRes) => {
                dispatch(setBundleSelectedForms(bundleRes.data));
              })
              .catch((err) => {
                dispatch(setFormFailureErrorData("form", err));
              })
              .finally(() => {
                dispatch(setFormStatusLoading(false));
              });
          } else {
            dispatch(setFormStatusLoading(false));
          }
        })
      );
    }
  }, [isAuthenticated, formId]);

  useEffect(() => {
    return () => {
      let payload = getDraftReqFormat(formId, draftRef.current);
      if (poll) saveDraft(payload, exitType.current);
    };
  }, [poll, exitType.current, draftSubmission?.id]);

  if (isActive || isPublicStatusLoading || formStatusLoading) {
    return (
      <div data-testid="loading-view-component">
        <Loading />
      </div>
    );
  }

  const deleteDraft = () => {
    dispatch(
      setDraftDelete({
        modalOpen: true,
        draftId: draftSubmission.id,
        draftName: draftSubmission.DraftName,
      })
    );
  };

  const onYes = (e) => {
    e.currentTarget.disabled = true;
    deleteDraftbyId(draftDelete.draftId)
      .then(() => {
        toast.success(t("Draft Deleted Successfully"));
        dispatch(push(`${redirectUrl}draft`));
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        dispatch(
          setDraftDelete({
            modalOpen: false,
            draftId: null,
            draftName: "",
          })
        );
      });
  };

  const onNo = () => {
    dispatch(
      setDraftDelete({
        modalOpen: false,
        draftId: null,
        draftName: "",
      })
    );
  };

  if (isFormSubmitted && !isAuthenticated) {
    //This code has relevance only for form Submission Edit by Anonymous Users
    return (
      <div className="text-center pt-5">
        <h1>{t("Thank you for your response.")}</h1>
        <p>{t("saved successfully")}</p>
      </div>
    );
  }

  return (
    <div className="container overflow-y-auto">
      {
        <>
          <span className="pr-2  mr-2 d-flex justify-content-end align-items-center">
            {poll && showNotification && (
              <SavingLoading
                text={
                  draftSaved
                    ? t("Saved to Applications/Drafts")
                    : t("Saving...")
                }
                saved={draftSaved}
              />
            )}
          </span>
        </>
      }
      <div className="d-flex align-items-center justify-content-between">
        <div className="main-header">
          <SubmissionError
            modalOpen={props.submissionError.modalOpen}
            message={props.submissionError.message}
            onConfirm={props.onConfirm}
          ></SubmissionError>
          {isAuthenticated ? (
            <Link title={t("go back")} to={`${redirectUrl}draft`}>
              <i className="fa fa-chevron-left fa-lg" />
            </Link>
          ) : null}

          {form.title ? (
            <h3 className="ml-3">
              <span className="task-head-details">
                <i className="fa fa-wpforms" aria-hidden="true" /> &nbsp;{" "}
                {t("Drafts")}/
              </span>{" "}
              {form.title}
            </h3>
          ) : (
            ""
          )}
        </div>
        {processData?.status === "active" ? (
          <button
            className="btn btn-danger mr-2"
            style={{ width: "8.5em" }}
            onClick={() => deleteDraft()}
          >
            {t("Discard Draft")}
          </button>
        ) : (
          ""
        )}
      </div>
      <Errors errors={errors} />
      <LoadingOverlay
        active={isFormSubmissionLoading && !bundleSubmitLoading}
        spinner
        text={<Translation>{(t) => t("Loading...")}</Translation>}
        className="col-12"
      >
        <div className="ml-4 mr-4">
          <Confirm
            modalOpen={draftDelete.modalOpen}
            message={`${t("Are you sure you wish to delete the draft")} "${
              draftDelete.draftName
            }" 
            ${t("with ID")} "${draftDelete.draftId}"`}
            onNo={() => onNo()}
            onYes={(e) => {
              exitType.current = "SUBMIT";
              onYes(e);
            }}
          />
          {processData?.status === "active" ? (
            processData.formType === "bundle" ? (
              <BundleSubmit
                onSubmit={(data) => {
                  setPoll(false);
                  exitType.current = "SUBMIT";
                  onSubmit(data, form._id, isPublic, processData);
                }}
                onChange={(e) => {
                  setDraftData(e.data);
                }}
                draftRef={draftRef}
              />
            ) : (
              <div className="form-view-wrapper">
                <Form
                  form={form}
                  submission={submission.submission}
                  url={url}
                  options={{
                    ...options,
                    language: lang,
                    i18n: formio_resourceBundles,
                  }}
                  hideComponents={hideComponents}
                  onChange={(formData) => {
                    setDraftData(formData.data);
                    draftRef.current = formData.data;
                  }}
                  onSubmit={(data) => {
                    setPoll(false);
                    exitType.current = "SUBMIT";
                    onSubmit(data, form._id, isPublic);
                  }}
                  onCustomEvent={(evt) => onCustomEvent(evt, redirectUrl)}
                />
              </div>
            )
          ) : (
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
          )}
        </div>
      </LoadingOverlay>
    </div>
  );
});

const executeAuthSideEffects = (dispatch, redirectUrl) => {
  dispatch(push(`${redirectUrl}draft`));
};

// eslint-disable-next-line no-unused-vars
const doProcessActions = (submission, ownProps) => {
  return (dispatch, getState) => {
    const state = getState();
    let form = state.form.form;
    let isAuth = state.user.isAuthenticated;
    const processData = state.process.formProcessList;
    const tenantKey = state.tenants?.tenantId;
    const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : `/`;
    dispatch(resetSubmissions("submission"));
    const origin = `${window.location.origin}${redirectUrl}`;
    const data = getProcessReq(form, submission._id, origin);
    if (processData.formType === "bundle") {
      data.data = submission.data;
    }
    let draft_id = state.draft.submission?.id;
    let isDraftCreated = draft_id ? true : false;
    const applicationCreateAPI = selectApplicationCreateAPI(
      isAuth,
      isDraftCreated,
      DRAFT_ENABLED
    );
    dispatch(
      applicationCreateAPI(data, draft_id ? draft_id : null, (err) => {
        dispatch(setFormSubmissionLoading(false));
        if (!err) {
          toast.success(
            <Translation>{(t) => t("Submission Saved")}</Translation>
          );
        } else {
          toast.error(
            <Translation>{(t) => t("Submission Failed.")}</Translation>
          );
        }
        if (isAuth) executeAuthSideEffects(dispatch, redirectUrl);
        else dispatch(setFormSubmitted(true));
      })
    );
  };
};

const mapStateToProps = (state) => {
  return {
    user: state.user.userDetail,
    tenant: state?.tenants?.tenantId,
    form: selectRoot("form", state),
    submission: selectRoot("draft", state),
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
    onSubmit: (submission, formId, isPublic, processData) => {
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
          dispatch(setBundleSubmitLoading(false));
          dispatch(setFormSubmissionError(ErrorDetails));
        }
      };
      if (CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE) {
        postCustomSubmission(submission, formId, isPublic, callBack);
      } else {
        if (processData.formType === "bundle") {
          formioPostSubmission(submission, formId, true)
            .then((res) => {
              dispatch(setBundleSubmissionData({ data: res.data.data }));
              callBack(null, res.data);
            })
            .catch(() => {
              const ErrorDetails = {
                modalOpen: true,
                message: "Submission cannot be done.",
              };
              toast.error("Submission cannot be done.");
              dispatch(setFormSubmissionError(ErrorDetails));
              dispatch(setBundleSubmitLoading(false));
            });
        } else {
          dispatch(saveSubmission("submission", submission, formId, callBack));
        }
      }
    },
    onCustomEvent: (customEvent, redirectUrl) => {
      switch (customEvent.type) {
        case CUSTOM_EVENT_TYPE.CUSTOM_SUBMIT_DONE:
          toast.success("Submission Saved.");
          dispatch(push(`${redirectUrl}draft`));
          break;
        case CUSTOM_EVENT_TYPE.CANCEL_SUBMISSION:
          dispatch(push(`${redirectUrl}draft`));
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
