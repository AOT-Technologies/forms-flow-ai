import React, { useState } from "react";
import Buttons from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
const SaveNext = React.memo(
  ({
    handleNext,
    handleBack,
    activeStep,
    isLastStep,
    submitData,
    modified,
    isDisabled
  }) => {
    const applicationCount = useSelector(
      (state) => state.process?.applicationCount
    );
    const { t } = useTranslation();
    const handleChanges = () => {
      if (applicationCount > 0) {
        if (modified) {
          handleShow();
        } else if (!isLastStep) {
          handleNext();
        } else {
          submitData();
        }
      } else {
        !isLastStep ? handleNext() : submitData();
      }
    };
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
      <>
        <Buttons
          className="mx-2"
          variant="outline-secondary"
          disabled={activeStep === 0}
          onClick={handleBack}
          data-testid="form-back-button"
        >
          {t("Back")}
        </Buttons>
        <Buttons
          variant="primary"
          onClick={handleChanges}
          disabled={isDisabled}
          data-testid="form-save-next-button"
        >
          {isLastStep ? t("Save") : t("Next")}
        </Buttons>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header>
            <Modal.Title>{t("Confirmation")}</Modal.Title>
            <button type="button" className="btn-close" aria-label="Close" onClick={handleClose}></button>
          </Modal.Header>
          <Modal.Body>
            {t(
              "Changing the form workflow will not affect the existing submissions. " +
              "It will only update in the newly created submissions. " +
              "Press Save Changes to continue or cancel the changes."
            )}
          </Modal.Body>
          <Modal.Footer>
            <button type="button"
              className="btn btn-link text-dark"
              onClick={handleClose}>
              {t("Cancel")}
            </button>
            <Buttons
              variant="primary"
              onClick={!isLastStep ? handleNext : submitData}
            >
              {t("Save Changes")}
            </Buttons>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
);
export default SaveNext;