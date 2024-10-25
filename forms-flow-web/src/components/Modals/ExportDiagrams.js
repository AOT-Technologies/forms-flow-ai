import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import ProgressBar from "react-bootstrap/ProgressBar";
import { CloseIcon, CustomButton, FailedIcon } from "@formsflow/components"; // Icons for success/failure
import { Translation } from "react-i18next";

const ExportDiagram = React.memo(
  ({
    showExportModal,
    onClose,
    onExport,
    fileName,
    modalTitle = "Export BPMN",
    successMessage = "Export Successful",
    errorMessage = null,
    retryButtonText = "Try Again",
    cancelButtonText = "Cancel",
  }) => {
    const [state, setState] = useState({
      progress: 0,
      exportStatus: "Export in Progress",
      isExportComplete: false,
      isError: false,
    });

    const { progress, exportStatus, isExportComplete, isError } = state;

    // Helper function to reset state for retry or new export
    const resetState = (hasError = false) => {
      setState({
        progress: hasError ? 100 : 0, // Set progress to 100 in case of error
        exportStatus: hasError ? "Export failed" : "Export in Progress",
        isExportComplete: hasError, // Set complete only in case of error
        isError: hasError,
      });
    };

    const exportData = () => {
      resetState(); // Reset to initial state for new export
      onExport({
        onProgress: (percentCompleted) => {
          setState((prevState) => ({
            ...prevState,
            progress: percentCompleted,
          }));
        },
      })
        .then(() => {
          setState((prevState) => ({
            ...prevState,
            progress: 100,
            isExportComplete: true,
            isError: !!errorMessage, // If errorMessage exists, it's an error case
            exportStatus: errorMessage ? "Export failed" : successMessage,
          }));
        })
        .catch(() => {
          setState({
            progress: 100, // Ensure progress reaches 100 in error case
            exportStatus: "Export failed",
            isExportComplete: true,
            isError: true,
          });
        });
    };

    useEffect(() => {
      if (showExportModal) {
        if (!errorMessage) {
          exportData(); // Start export if there's no error
        } else {
          resetState(true); // If errorMessage exists, set error state
        }
      } else {
        resetState(); // Reset modal state when closed
      }
    }, [showExportModal, errorMessage]);

    return (
      <Modal
        show={showExportModal}
        onHide={onClose}
        centered
        aria-labelledby="contained-modal-title-vcenter"
        scrollable
        size="sm"
      >
        <Modal.Header>
          <Modal.Title>
            <b>
              <Translation>{(t) => t(modalTitle)}</Translation>
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
            variant="primary"
          />
          <div className="mt-2 text-wrap d-flex align-items-center">
            <span className="text-dark">{fileName}&nbsp;</span>
            <span className={isError ? "text-danger" : "text-primary"}>
              {isError ? (
                <>
                  <Translation>
                    {(t) => (
                      <>
                        {t(exportStatus)} <FailedIcon color="ff-danger" />
                      </>
                    )}
                  </Translation>
                </>
              ) : (
                <Translation>{(t) => t(successMessage)}</Translation>
              )}
            </span>
          </div>
          {isError && (
            <div className="text-danger mt-2">
              <p>
                <Translation>
                  {(t) =>
                    t(
                      "A system error occurred during export. Please try again."
                    )
                  }
                </Translation>
              </p>
            </div>
          )}
        </Modal.Body>
        {isError && <Modal.Footer className="d-flex justify-content-start flex-wrap">
            <>
              <CustomButton
                variant="primary"
                size="md"
                label={<Translation>{(t) => t(retryButtonText)}</Translation>}
                onClick={exportData}
                className="mb-2"
                dataTestid="try-again"
                ariaLabel="Try Again"
              />
              <CustomButton
                variant="secondary"
                size="md"
                label={<Translation>{(t) => t(cancelButtonText)}</Translation>}
                onClick={onClose}
                className="mb-2"
                dataTestid="cancel"
                ariaLabel="Cancel"
              />
            </>
        </Modal.Footer>
        }
      </Modal>
    );
  }
);

export default ExportDiagram;
