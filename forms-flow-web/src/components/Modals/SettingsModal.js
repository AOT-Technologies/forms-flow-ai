import React, { useRef } from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@formsflow/components";

import FormSettings from "../Form/EditForm/FormSettings";
const SettingsModal = ({ show, handleClose, handleConfirm }) => {
  const { t } = useTranslation();
  const FormSettingsRef = useRef();

  const handleConfirmFunction = () => {
     handleConfirm(FormSettingsRef.current);
  };
  return (
    <Modal
      className="d-flex flex-column align-items-start w-100 settings-modal"
      show={show}
      onHide={handleClose}
      size="sm"
      backdrop="static"
    >
      <Modal.Header>
        <Modal.Title>{t("Settings")}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <FormSettings
          ref={FormSettingsRef}
          handleConfirm={handleConfirm}
          handleClose={handleClose}
        />
      </Modal.Body>
      <Modal.Footer>
        <CustomButton
          variant="primary"
          size="md"
          label={t("Save Changes")}
          onClick={handleConfirmFunction}
          dataTestid="save-form-settings"
          ariaLabel={t("Save Form Settings")}
        />

        <CustomButton
          variant="secondary"
          size="md"
          label={t("Discard Changes")}
          onClick={handleClose}
          dataTestid="cancel-form-settings"
          ariaLabel={t("Cancel Form Settings")}
        />
      </Modal.Footer>
    </Modal>
  );
};

export default SettingsModal;
