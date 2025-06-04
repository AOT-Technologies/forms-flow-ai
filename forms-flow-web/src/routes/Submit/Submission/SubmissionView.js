import React, { useEffect, useState, useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import startCase from "lodash/startCase";
import { Card } from "react-bootstrap";
import {
  CustomButton,
  BackToPrevIcon,
  FormSubmissionHistoryModal,
} from "@formsflow/components";
import { getApplicationById } from "../../../apiManager/services/applicationServices";
import Loading from "../../../containers/Loading";
import {
  setApplicationDetailLoader,
  setApplicationDetailStatusCode,
} from "../../../actions/applicationActions";
import View from "../../../routes/Submit/Submission/Item/View";
import { getForm, getSubmission } from "@aot-technologies/formio-react";
import NotFound from "../../../components/NotFound";
import { useTranslation } from "react-i18next";
import {
  CUSTOM_SUBMISSION_URL,
  CUSTOM_SUBMISSION_ENABLE,
} from "../../../constants/constants";
import { getCustomSubmission } from "../../../apiManager/services/FormServices";
import { HelperServices } from "@formsflow/service";
import DownloadPDFButton from "../../../components/Form/ExportAsPdf/downloadPdfButton";
import { setUpdateHistoryLoader } from "../../../actions/taskApplicationHistoryActions";
import { fetchApplicationAuditHistoryList } from "../../../apiManager/services/applicationAuditServices";

const ViewApplication = React.memo(() => {
  const { t } = useTranslation();
  const { applicationId } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();

  const { applicationDetail, applicationDetailStatusCode, isApplicationDetailLoading } =
   useSelector(
    (state) => ({
    applicationDetail: state.applications.applicationDetail,
    applicationDetailStatusCode: state.applications.applicationDetailStatusCode,
    isApplicationDetailLoading: state.applications.isApplicationDetailLoading,
    })
    );
  const submission = useSelector((state) => state.submission?.submission || {});
  const form = useSelector((state) => state.form?.form || {});
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { appHistory, isHistoryListLoading } = useSelector(
    useMemo(() => (state) => ({
      appHistory: state.taskAppHistory.appHistory,
      isHistoryListLoading: state.taskAppHistory.isHistoryListLoading,
    }), [])
  );

  useEffect(() => {
    dispatch(setUpdateHistoryLoader(true));
  }, [dispatch]);

  useEffect(() => {
    dispatch(setApplicationDetailLoader(true));
    dispatch(
      getApplicationById(applicationId, (err, res) => {
        if (!err) {
          if (res.submissionId && res.formId) {
            dispatch(getForm("form", res.formId));
            if (CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE) {
              dispatch(getCustomSubmission(res.submissionId, res.formId));
            } else {
              dispatch(
                getSubmission("submission", res.submissionId, res.formId)
              );
            }
          }
        }
      })
    );

    return () => {
      dispatch(setApplicationDetailLoader(true));
      dispatch(setApplicationDetailStatusCode(""));
    };
  }, [applicationId, dispatch]);


 useEffect(() => {
    if (applicationId && isHistoryListLoading) {
      dispatch(fetchApplicationAuditHistoryList(applicationId));
    }
  }, [applicationId, isHistoryListLoading, dispatch]);

  if (isApplicationDetailLoading) {
    return <Loading />;
  }

  if (
    Object.keys(applicationDetail).length === 0 &&
    applicationDetailStatusCode === 403
  ) {
    return (
      <NotFound
        errorMessage={t("Access Denied")}
        errorCode={applicationDetailStatusCode}
      />
    );
  }

  const backToSubmissionList = () => {
    history.goBack();
  };

  return (
    <div>
      {/* Header Section */}
      <Card className="editor-header">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            {/* Left: Back Icon & Application Name */}
            <div className="d-flex align-items-center">
              <BackToPrevIcon onClick={backToSubmissionList} />
              <div className="ms-4 editor-header-text">
                {startCase(applicationDetail.applicationName)}
              </div>
            </div>

            {/* Center: Submitted On Date - Right Aligned */}
            <div
              data-testid="submissions-details"
              className="d-flex align-items-center white-text ms-auto me-4"
            >
              <span className="status-live"></span>
              {t("Submitted On")}:{" "}
              <span data-testid="submissions-date">{HelperServices?.getLocalDateAndTime(applicationDetail.created)}</span>
            </div>

            {/* Right: Buttons */}
            <div className="form-submission-button">
              <CustomButton
                variant="gray-dark"
                size="table"
                label={t("History")}
                dataTestId="handle-submission-history-testid"
                ariaLabel={t("Submission History Button")}
                onClick={() => setShowHistoryModal(true)}
              />
              <DownloadPDFButton
                form_id={form._id}
                submission_id={submission._id}
                title={form.title}
              />
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* View Application Details */}
      <View page="application-detail"/>
        <FormSubmissionHistoryModal
          show={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          title="History"
          allHistory={appHistory}
          historyCount={appHistory.length}
        />
    </div>
  );
});

export default ViewApplication;
