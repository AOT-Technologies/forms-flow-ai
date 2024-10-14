import React from "react";
import Modal from "react-bootstrap/Modal";
import { CloseIcon, CustomButton } from "@formsflow/components";
import { Translation } from "react-i18next";

const ConfirmSubmissionModal = ({ show, onClose }) => {
  return (
    <Modal show={show} onHide={onClose} dialogClassName="modal-50w">
      <Modal.Header>
        <Modal.Title>
          <b>
            <Translation>
              {(t) => t("Submission Present: Please Confirm Action")}
            </Translation>
          </b>
        </Modal.Title>
        <div className="d-flex align-items-center">
          <CloseIcon width="16.5" height="16.5" onClick={onClose} />
        </div>
      </Modal.Header>
      <Modal.Body className="build-modal-body">
        <label className="form-label">You have submissions for this form. What would you like to do?</label>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-start">
        <CustomButton
          size="md"
          label={<Translation>{(t) => t("Cancel")}</Translation>}
          onClick={onClose}
          dataTestid="cancel-button"
          ariaLabel="Cancel Action"
        />
        <CustomButton
          variant="light"
          size="md"
          label={<Translation>{(t) => t("Proceed with Deletion")}</Translation>}
          onClick={() => {
            // Handle deletion logic here, if necessary
            onClose(); // Close the modal after action
          }}
          dataTestid="confirm-delete-button"
          ariaLabel="Confirm Deletion"
        />
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmSubmissionModal;
