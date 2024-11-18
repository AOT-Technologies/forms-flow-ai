import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { CloseIcon, CustomButton, FailedIcon } from "@formsflow/components";
import ProgressBar from "react-bootstrap/ProgressBar";
import { Translation } from "react-i18next";
import { getFormExport } from "../../apiManager/services/FormServices";

const ExportModal = React.memo(({ showExportModal, onClose, mapperId, formName }) => {
  const [progress, setProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState("Export in Progress");
  const [isExportComplete, setIsExportComplete] = useState(false);
  const [isError, setIsError] = useState(false); // Flag to indicate if an error occurred
  const fileName = `${formName}.json`;
  const exportForm = () => {
    // Ensure the progress is reset before starting the export process
    setProgress(0);
    setExportStatus("Export in Progress");
    setIsExportComplete(false);
    setIsError(false); // Reset the error state on retry

    getFormExport(mapperId, {
      responseType: "blob", // Ensure the response is treated as binary
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        } else {
          // Fallback: Manually increment progress if length is not computable
          setProgress((prevProgress) => Math.min(prevProgress + 10, 100)); // Increment progress manually
        }
      },
    })
      .then((response) => {
        const jsonString = JSON.stringify(response.data, null, 2); // Pretty-print JSON
        const blob = new Blob([jsonString], { type: "application/json" });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Once the download is complete, mark the progress as 100%
        setProgress(100);
        setExportStatus("Export Successful");
        setIsExportComplete(true);
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message || "Export Failed";

        // Set the progress to 100% even when there is an error
        setProgress(100);
        setExportStatus(errorMessage);
        setIsError(true); // Mark the export as failed
        setIsExportComplete(true);
      });
  };

  // Reset the progress when the modal is closed or when the export finishes
  useEffect(() => {
    if (showExportModal) {
      exportForm();
    } else {
      // Reset progress when modal is closed
      setProgress(0);
      setIsExportComplete(false);
      setIsError(false);
    }
  }, [showExportModal, mapperId]);

  return (
    <Modal
      show={showExportModal}
      onHide={onClose}
      dialogClassName="modal-50w" // This will control the modal width
      centered // Center the modal on the screen
      aria-labelledby="contained-modal-title-vcenter"
      scrollable // Ensures content is scrollable on small screens
    >
      <Modal.Header>
        <Modal.Title>
          <b>
            <Translation>{(t) => t("Export Form")}</Translation>
          </b>
        </Modal.Title>
        <div className="d-flex align-items-center">
          <CloseIcon width="16.5" height="16.5" onClick={onClose} />
        </div>
      </Modal.Header>
      <Modal.Body className="build-modal-body">
        <ProgressBar
          now={progress}
          animated={!isExportComplete && !isError}
          variant="primary" // Always primary for the progress bar
        />
        <div className="mt-2 text-wrap d-flex align-items-center">
          {/* Keep FileName.json black */}
          <span className="text-dark">{fileName}&nbsp;</span>
          <span className={isError ? "text-danger" : "text-primary"}>
            {/* Display the failure message in red or success message in blue */}
            {isError ? (
              <Translation>
                {(t) => (
                  <>
                    {t("Export Failed")} <FailedIcon color="red" />
                  </>
                )}
              </Translation>
            ) : (
              <Translation>{(t) => t(exportStatus)}</Translation>
            )}
          </span>
        </div>
        {isError && (
          <div className="text-danger mt-2">
            <p>
              <Translation>
                {(t) =>
                  t("A system error occurred during export. Please try again.")
                }
              </Translation>
            </p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-start flex-wrap">
        {isError && ( // Only show buttons if there's an error
          <>
            <CustomButton
              variant="primary"
              size="md"
              label={<Translation>{(t) => t("Try Again")}</Translation>}
              onClick={() => {
                setProgress(0); // Reset progress before retrying
                exportForm();
              }}
              className="mb-2"
              dataTestid="try-again"
              ariaLabel="Try Again"
            />
            <CustomButton
              variant="secondary"
              size="md"
              label={<Translation>{(t) => t("Cancel")}</Translation>}
              onClick={onClose}
              className="mb-2"
              dataTestid="cancel"
              ariaLabel="Cancel"
            />
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
});

export default ExportModal;
