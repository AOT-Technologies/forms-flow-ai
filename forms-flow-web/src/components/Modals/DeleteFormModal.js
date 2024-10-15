import React from "react";
import Modal from "react-bootstrap/Modal";
import { CloseIcon, CustomButton } from "@formsflow/components";

const DeleteFormModal = React.memo(
  ({
    showDeleteModal,
    onClose,
    onYes,
    onNo,
    message,
    yesText,
    noText,
    modalHeadder,
  }) => {
    return (
      <>
        <Modal
          show={showDeleteModal}
          onHide={onClose}
          dialogClassName="modal-50w"
        >
          <Modal.Header>
            <Modal.Title>
              <b>{modalHeadder}</b>
            </Modal.Title>
            <div className="d-flex align-items-center">
              <CloseIcon width="16.5" height="16.5" onClick={onClose} />
            </div>
          </Modal.Header>
          <Modal.Body className="build-modal-body">
            <label className="form-label">{message}</label>
          </Modal.Body>
          <Modal.Footer className="d-flex justify-content-start">
            <CustomButton
              //variant={nameError ? "dark" : "primary"}
              size="md"
              //disabled={nameError || formSubmitted}
              label={noText}
              //buttonLoading={!nameError && formSubmitted ? true : false}
              onClick={onNo}
              className=""
              dataTestid={`No-Keep-This-Form`}
              ariaLabel="No Keep This Form"
            />
            <CustomButton
              variant="light"
              size="md"
              label={yesText}
              onClick={onYes}
              className=""
              dataTestid="confirm-Delete"
            />
          </Modal.Footer>
        </Modal>
      </>
    );
  }
);

export default DeleteFormModal;
