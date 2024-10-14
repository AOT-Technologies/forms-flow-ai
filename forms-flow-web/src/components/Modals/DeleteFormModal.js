import React from "react";
import Modal from "react-bootstrap/Modal";
import { CloseIcon, CustomButton } from "@formsflow/components";
import { Translation } from "react-i18next";

const DeleteFormModal = React.memo(({ showDeleteModal, onClose,onYes,onNo }) => {
  return (
    <>
      <Modal
        show={showDeleteModal}
        onHide={onClose}
        dialogClassName="modal-50w"
      >
        <Modal.Header>
          <Modal.Title>
            <b>
              <Translation>
                {(t) => t("Are You Sure Want to Delete This Form?")}
              </Translation>
            </b>
          </Modal.Title>
          <div className="d-flex align-items-center">
            <CloseIcon width="16.5" height="16.5" onClick={onClose} />
          </div>
        </Modal.Header>
        <Modal.Body className="build-modal-body">
          <label className="form-label">This Action cannot be undone</label>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-start">
          <CustomButton
            //variant={nameError ? "dark" : "primary"}
            size="md"
            //disabled={nameError || formSubmitted}
            label={<Translation>{(t) => t("No Keep This Form")}</Translation>}
            //buttonLoading={!nameError && formSubmitted ? true : false}
            onClick={onNo}
            className=""
            dataTestid={`No-Keep-This-Form`}
            ariaLabel="No Keep This Form"
          />
          <CustomButton
            variant="light"
            size="md"
            label={
              <Translation>{(t) => t("Yes Delete This Form")}</Translation>
            }
            onClick={onYes}
            className=""
            dataTestid="confirm-Delete"
            ariaLabel="Yes Delete This Form"
          />
        </Modal.Footer>
      </Modal>
    </>
  );
});

export default DeleteFormModal;

