// React & Redux dependencies
import React, { useEffect, useState, useRef } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Card } from "react-bootstrap";

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
import { useTranslation, Translation } from "react-i18next";
import Loading from "../../../../containers/Loading";
import SubmissionError from "../../../../containers/SubmissionError";
import LoadingOverlay from "react-loading-overlay-ts";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { BackToPrevIcon } from "@formsflow/components";

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
import {
    getFormProcesses
} from "../../../../apiManager/services/processServices";
import {
    updateApplicationEvent,
    getApplicationById
} from "../../../../apiManager/services/applicationServices";
import {
    fetchFormById
} from "../../../../apiManager/services/bpmFormServices";
import {
    getCustomSubmission,
    updateCustomSubmission
} from "../../../../apiManager/services/FormServices";

import {
    UPDATE_EVENT_STATUS,
    getProcessDataReq
} from "../../../../constants/applicationConstants";
import {
    CUSTOM_SUBMISSION_URL,
    CUSTOM_SUBMISSION_ENABLE,
    MULTITENANCY_ENABLED
} from "../../../../constants/constants";
import { navigateToFormEntries } from "../../../../helper/routerHelper";
import { RESOURCE_BUNDLES_DATA } from "../../../../resourceBundles/i18n";
import { renderPage, textTruncate } from "../../../../helper/helper";

const Resubmit = React.memo((props) => {
    // Constants & Helpers
    const {
        isAuthenticated,
        errors,
        onSubmit,
        onFormSubmit,
        options,
        onCustomEvent,
        submissionError,
        submission,
    } = props;

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { formId, submissionId } = useParams();
    const [parentFormId, setParentFormId] = useState(null);
    const isPublic = !isAuthenticated;
    const [form, setForm] = useState(null);
    const [updatedSubmissionData, setUpdatedSubmissionData] = useState({});
    const [loading, setLoading] = useState(true);
    const [formStatus, setFormStatus] = useState("");
    const lang = useSelector((state) => state.user.lang);
    const tenantKey = useSelector((state) => state.tenants?.tenantId);
    const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
    const applicationDetail = useSelector((state) => state.applications.applicationDetail);
    const isFormSubmissionLoading = useSelector((state) =>
        state.formDelete.isFormSubmissionLoading);
    const isSubActive = useSelector((state) => selectRoot("submission", state).isActive);
    const applicationDetailRef = useRef(applicationDetail);
    const customSubmission = useSelector((state) => state.customSubmission?.submission || {});
    const submissionState = useSelector((state) =>
        CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE
            ? customSubmission
            : selectRoot("submission", state).submission
    );
    const submissionData = submissionState?.data;

    useEffect(() => {
        if (!isAuthenticated) return;
        dispatch(setFormStatusLoading(true));
        dispatch(getFormProcesses(formId, (err, data) => {
            if (!err) setFormStatus(data.status);
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

    const handleFormSubmit = (submission) => {
        const latestDetail = applicationDetailRef.current;
        setUpdatedSubmissionData(submission);
        onSubmit(
            submission,
            latestDetail,
            onFormSubmit,
            form?._id,
            redirectUrl,
            handleBack
        );
    };

    const handleBack = () => {
        navigateToFormEntries(dispatch, tenantKey, parentFormId || formId);
    };

    const renderHeader = () => (
        <Card className="user-form-header">
            <Card.Body>
                <SubmissionError
                    modalOpen={submissionError.modalOpen}
                    message={submissionError.message}
                    onConfirm={props.onConfirm}
                />
                <div className="d-flex justify-content-between align-items-center">
                    <div className="icon-title-container">
                        {!isPublic && (
                            <BackToPrevIcon
                                title={t("Back to Form List")}
                                data-testid="back-to-form-list"
                                onClick={handleBack}
                            />
                        )}
                        <div className="user-form-header-text">
                            {textTruncate(100, 97, form?.title)}
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );

    if (loading || isSubActive || !submissionData) return <Loading />;

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
                            submission={isFormSubmissionLoading ? updatedSubmissionData
                                : submissionState}
                            url={submission.url}
                            onSubmit={handleFormSubmit}
                            options={{
                                ...options,
                                i18n: RESOURCE_BUNDLES_DATA,
                                language: lang,
                                buttonSettings: { showCancel: false }
                            }}
                            onCustomEvent={onCustomEvent}
                        />
                    ) : (
                        renderPage(formStatus)
                    )}
                </div>
            </LoadingOverlay>
        </div>
    );
});

Resubmit.defaultProps = {
    onCustomEvent: () => { }
};

Resubmit.propTypes = {
    onCustomEvent: PropTypes.func,
    form: PropTypes.object,
    submission: PropTypes.object,
    errors: PropTypes.array,
    options: PropTypes.object,
    onConfirm: PropTypes.func,
    submissionError: PropTypes.object,
    onSubmit: PropTypes.func,
    onFormSubmit: PropTypes.func
};

const mapStateToProps = (state) => ({
    user: state.user.userDetail,
    form: selectRoot("form", state),
    submission: selectRoot("submission", state),
    isAuthenticated: state.user.isAuthenticated,
    errors: [selectError("form", state), selectError("submission", state)],
    options: {
        noAlerts: false,
        i18n: {
            en: {
                error: (
                    <Translation>{(t) => t("Please fix the errors before submitting again.")}</Translation>
                )
            }
        }
    },
    submissionError: state.formDelete.formSubmissionError
});

const mapDispatchToProps = (dispatch, ownProps) => {
    const handleSubmissionSuccess = (submission, onFormSubmit, handleBack) => {
        dispatch(resetSubmissions("submission"));
        dispatch(setFormSubmissionLoading(false));

        if (onFormSubmit) {
            onFormSubmit();
        } else {
            toast.success(<Translation>{(t) => t("Submission Saved")}</Translation>);
            handleBack();
        }
    };

    const handleSubmissionError = () => {
        dispatch(setFormSubmissionLoading(false));
        dispatch(setFormSubmissionError({
            modalOpen: true,
            message: <Translation>{(t) => t("Submission cannot be done.")}</Translation>
        }));
        toast.error(<Translation>{(t) => t("Error while Submission.")}</Translation>);
    };

    const handleApplicationEvent = (applicationDetail, submission, onFormSubmit, handleBack) => {
        const data = getProcessDataReq(applicationDetail, submission.data);
        dispatch(updateApplicationEvent(applicationDetail.id, data, () => {
            handleSubmissionSuccess(submission, onFormSubmit, handleBack);
        }));
    };

    return {
        onSubmit: (
            submission,
            applicationDetail,
            onFormSubmit,
            formId,
            redirectUrl,
            handleBack
        ) => {
            dispatch(setFormSubmissionLoading(true));
            const callBack = (err, submission) => {
                if (!err) {
                    if (UPDATE_EVENT_STATUS.includes(applicationDetail.applicationStatus) 
                        || applicationDetail.isResubmit) {
                        handleApplicationEvent(
                             applicationDetail,
                             submission, 
                             onFormSubmit, 
                             handleBack
                            );
                    } else {
                        handleSubmissionSuccess(submission, onFormSubmit, redirectUrl, handleBack);
                    }
                } else {
                    handleSubmissionError();
                }
            };

            const formKey = onFormSubmit ? formId : ownProps.match?.params?.formId;
            if (CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE) {
                updateCustomSubmission(submission, formKey, callBack);
            } else {
                dispatch(saveSubmission("submission", submission, formKey, callBack));
            }
        },
        onConfirm: () => {
            dispatch(setFormSubmissionError({ modalOpen: false, message: "" }));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Resubmit);
