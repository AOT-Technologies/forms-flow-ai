import React, { useState, useEffect } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import Modal from "react-bootstrap/Modal";
import ProgressBar from "react-bootstrap/ProgressBar";
import { CloseIcon, CustomButton, FailedIcon } from "@formsflow/components";
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

    const resetState = (hasError = false) => {
      setState({
        progress: hasError ? 100 : 0,
        exportStatus: hasError ? "Export failed" : "Export in Progress",
        isExportComplete: hasError,
        isError: hasError,
      });
    };

    const exportData = () => {
      resetState();
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
            isError: !!errorMessage,
            exportStatus: errorMessage ? "Export failed" : successMessage,
          }));
        })
        .catch(() => {
          setState({
            progress: 100,
            exportStatus: "Export failed",
            isExportComplete: true,
            isError: true,
          });
        });
    };

    useEffect(() => {
      if (showExportModal) {
        if (!errorMessage) {
          exportData();
        } else {
          resetState(true);
        }
      } else {
        resetState();
      }
    }, [showExportModal, errorMessage]);

    return (
      <Modal
        show={showExportModal}
        onHide={onClose}
        aria-labelledby="contained-modal-title-vcenter"
        scrollable
        size="sm"
      >
        <Modal.Header>
          <Modal.Title>
            <p>
              <Translation>{(t) => t(modalTitle)}</Translation>
            </p>
          </Modal.Title>
          <div className="icon-close" onClick={onClose}>
            <CloseIcon />
          </div>
        </Modal.Header>
        <Modal.Body className="build-modal-body">
          <ProgressBar
            now={progress}
            animated={!isExportComplete && !isError}
            variant="primary"
          />
          <div className="mt-2 text-container text-wrap d-flex align-items-center">
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
        {isError && <Modal.Footer>
            <div className="buttons-row">
              <CustomButton
                label={<Translation>{(t) => t(retryButtonText)}</Translation>}
                onClick={exportData}
                dataTestId="try-again"
                ariaLabel="Try Again"
              />
              <CustomButton
                label={<Translation>{(t) => t(cancelButtonText)}</Translation>}
                onClick={onClose}
                dataTestId="cancel"
                ariaLabel="Cancel"
                secondary
              />
            </div>
        </Modal.Footer>}
      </Modal>
    );
  }
);

// Add PropTypes
ExportDiagram.propTypes = {
  showExportModal: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  fileName: PropTypes.string.isRequired,
  modalTitle: PropTypes.string,
  successMessage: PropTypes.string,
  errorMessage: PropTypes.string,
  retryButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
};

export default ExportDiagram;
