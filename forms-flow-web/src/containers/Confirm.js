import React from "react";
import Modal from "react-bootstrap/Modal";
import { CustomButton } from "@formsflow/components";
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
      <Modal  
        data-testid="delete-modal" 
        show={modalOpen}>
        <Modal.Header>
          <Modal.Title><p>{t("Delete Confirmation")}</p></Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <div className="buttons-row">
            <CustomButton
              label={noText}
              onClick={onNo}
              dataTestId="delete-cancel-button"
              ariaLabel={t("Save Form Settings")}
            />

            <CustomButton
              label={yesText}
              onClick={onYes}
              dataTestId="delete-confirm-button"
              ariaLabel={t("Save Form Settings")}
              secondary
            />

            {/* <button
              // type="button"
              // className="btn btn-link text-dark"
              // data-testid="delete-cancel-button"
              // onClick={onNo}
              >
              {noText}</button> */}

            {/* <button className="btn btn-danger" onClick={onYes} data-testid="delete-confirm-button">
              {yesText}
            </button> */}
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
});

export default Confirm;
