// React & Redux dependencies
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

// Formio and related utilities
import {
    Form,
    selectRoot,
    getSubmission,
    resetSubmissions,
    saveSubmission,
    selectError,
    Errors
} from "@aot-technologies/formio-react";
// UI Components and Helpers
import { Translation, useTranslation } from "react-i18next";
import Loading from "../../../../containers/Loading";
import SubmissionError from "../../../../containers/SubmissionError";
import LoadingOverlay from "react-loading-overlay-ts";
import { toast } from "react-toastify";
import { BreadCrumbs,BreadcrumbVariant } from "@formsflow/components";

// Actions
import {
    setFormStatusLoading
} from "../../../../actions/processActions";
import {
    setFormSubmissionError,
    setFormSubmissionLoading,
    clearSubmissionError
} from "../../../../actions/formActions";
import {
    setApplicationDetailLoader
} from "../../../../actions/applicationActions";

// API Services
import { getFormProcesses } from "../../../../apiManager/services/processServices";
import { updateApplicationEvent, getApplicationById } from "../../../../apiManager/services/applicationServices";
import { fetchFormById } from "../../../../apiManager/services/bpmFormServices";
import { getCustomSubmission, updateCustomSubmission } from "../../../../apiManager/services/FormServices";

import {
    UPDATE_EVENT_STATUS,
    getProcessDataReq
} from "../../../../constants/applicationConstants";
import {
  CUSTOM_SUBMISSION_URL,
  CUSTOM_SUBMISSION_ENABLE,
} from "../../../../constants/constants";
import { navigateToFormEntries, navigateToSubmitFormsListing } from "../../../../helper/routerHelper";
import { RESOURCE_BUNDLES_DATA } from "../../../../resourceBundles/i18n";

const Resubmit = React.memo(() => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { formId, submissionId } = useParams();
  const [parentFormId, setParentFormId] = useState(null);
  const [form, setForm] = useState(null);
  const [updatedSubmissionData, setUpdatedSubmissionData] = useState({});
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const lang = useSelector((state) => state.user.lang);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const applicationDetail = useSelector((state) => state.applications.applicationDetail);
  const isFormSubmissionLoading = useSelector((state) => state.formDelete.isFormSubmissionLoading);
  const isSubActive = useSelector((state) => selectRoot("submission", state).isActive);
  const customSubmission = useSelector((state) => state.customSubmission?.submission || {});
  const submissionError = useSelector((state) => state.formDelete.formSubmissionError);

  const submissionState = useSelector((state) =>
    CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE
      ? customSubmission
      : selectRoot("submission", state).submission
  );
  const submissionData = submissionState?.data;
  const errors = [
    useSelector((state) => selectError("form", state)),
    useSelector((state) => selectError("submission", state))
  ];

  const applicationDetailRef = useRef(applicationDetail);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(setFormStatusLoading(true));
    dispatch(getFormProcesses(formId, (err, data) => {
      setParentFormId(data?.parentFormId);
      dispatch(setFormStatusLoading(false));
    }));
  }, [isAuthenticated, dispatch, formId]);

    useEffect(() => {
        if (!submissionData?.applicationId) return;
        dispatch(setApplicationDetailLoader(true));
        dispatch(getApplicationById(submissionData.applicationId));
    }, [submissionData?.applicationId, dispatch]);

    useEffect(() => {
        if (!formId) return;
        fetchFormById(formId)
            .then((res) => setForm(res.data))
            .catch((err) => console.error("Error fetching form:", err.response?.data || err.message))
            .finally(() => setLoading(false));
    }, [formId]);

    useEffect(() => {
        dispatch(clearSubmissionError("submission"));
        if (CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE) {
            dispatch(getCustomSubmission(submissionId, formId));
        } else {
            dispatch(getSubmission("submission", submissionId, formId));
        }
    }, [dispatch, submissionId, formId]);

  useEffect(() => {
    applicationDetailRef.current = applicationDetail;
  }, [applicationDetail]);

  const handleBack = useCallback(() => {
    navigateToFormEntries(dispatch, tenantKey, parentFormId || formId);
  }, [dispatch, tenantKey, parentFormId, formId]);

  const handleSubmissionSuccess = useCallback((submission, onFormSubmit) => {
    dispatch(resetSubmissions("submission"));
    dispatch(setFormSubmissionLoading(false));

    if (onFormSubmit) {
      onFormSubmit();
    } else {
      toast.success(
        <Translation>{(t) => t("Submission Saved")}</Translation>
      );
      handleBack();
    }
  }, [dispatch, handleBack]);

  const handleSubmissionError = useCallback(() => {
    dispatch(setFormSubmissionLoading(false));
    dispatch(setFormSubmissionError({
      modalOpen: true,
      message: <Translation>{(t) => t("Submission cannot be done.")}</Translation>,
    }));
    toast.error(<Translation>{(t) => t("Error while Submission.")}</Translation>);
  }, [dispatch]);

  const handleApplicationEvent = useCallback(
    (applicationDetail, submission, onFormSubmit) => {
      const data = getProcessDataReq(applicationDetail, submission.data);
      dispatch(updateApplicationEvent(applicationDetail.id, data, () => {
        handleSubmissionSuccess(submission, onFormSubmit);
      }));
    },
    [dispatch, handleSubmissionSuccess]
  );

  const handleFormSubmit = (submission) => {
    const latestDetail = applicationDetailRef.current;
    setUpdatedSubmissionData(submission);
    dispatch(setFormSubmissionLoading(true));

    const callBack = (err, submissionRes) => {
      if (!err) {
        if (
          UPDATE_EVENT_STATUS.includes(latestDetail.applicationStatus) ||
          latestDetail.isResubmit
        ) {
          handleApplicationEvent(latestDetail, submissionRes, null);
        } else {
          handleSubmissionSuccess(submissionRes, null);
        }
      } else {
        handleSubmissionError();
      }
    };

    if (CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE) {
      updateCustomSubmission(submission, form?._id, callBack);
    } else {
      dispatch(saveSubmission("submission", submission, form?._id, callBack));
    }
  };

  const breadcrumbItems = [
    { id: "submit", label: t("Submit") },
    { id: "form-title", label: form?.title },
  ];

  const handleBreadcrumbClick = (item) => {
    if (item.id === "submit") {
      navigateToSubmitFormsListing(dispatch, tenantKey);
    } else if (item.id === "form-title") {
      handleBack();
    }
  };


  let scrollableOverview = "user-form-container";
  if (form?.display === "wizard") {
    scrollableOverview =  "user-form-container-with-wizard";
  }

  if (loading || isSubActive || !submissionData) return <Loading />;

  return (
      <div>
      {/* Header Section */}

        {isAuthenticated && (
          <div className="header-section-1">
              <div className="section-seperation-left d-block">
                  <BreadCrumbs 
                    items={breadcrumbItems}
                    variant={BreadcrumbVariant.MINIMIZED}
                    underline={false}
                    onBreadcrumbClick={handleBreadcrumbClick} 
                  /> 
                  {applicationDetail?.id ? (
                    <h4>{applicationDetail.id}</h4>
                  ) : null}
                  <SubmissionError
                    modalOpen={submissionError.modalOpen}
                    message={submissionError.message}
                    onConfirm={() =>
                      dispatch(setFormSubmissionError({ modalOpen: false, message: "" }))
                    }
                  />
              </div>
          </div>
        )}
        <Errors errors={errors} />
        <LoadingOverlay
          active={isFormSubmissionLoading}
          spinner
          text={<Translation>{(t) => t("Loading...")}</Translation>}
          className="col-12"
        >
        <div className={`wizard-tab ${scrollableOverview}`}>
          <Form
            form={form}
            submission={isFormSubmissionLoading ? updatedSubmissionData : submissionState}
            url={submissionState?.url}
            onSubmit={handleFormSubmit}
            options={{
              i18n: RESOURCE_BUNDLES_DATA,
              language: lang,
              buttonSettings: { showCancel: false },
            }}
            onCustomEvent={() => {}}
          />
        </div>   
      </LoadingOverlay>
    </div>
  );
});

export default Resubmit;
