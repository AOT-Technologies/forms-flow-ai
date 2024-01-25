import React from "react";
import Modal from "react-bootstrap/Modal";
import { useTranslation } from "react-i18next";

const Confirm = React.memo((props) => {
  const { t } = useTranslation();
  const {
    modalOpen = false,
    onYes,
    onNo,
    message,
    yesText = t("Delete"),
    noText = t("Cancel"),
  } = props;
  
  return (
    <>
      <Modal data-testid="delete-modal" show={modalOpen}>
        <Modal.Header>
          <Modal.Title>{t("Delete Confirmation")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-link text-dark"
            data-testid="delete-cancel-button"
            onClick={onNo}>
            {noText}</button>

          <button className="btn btn-danger" onClick={onYes} data-testid="delete-confirm-button">
            {yesText}
          </button>

        </Modal.Footer>
      </Modal>
    </>
  );
});

export default Confirm;
