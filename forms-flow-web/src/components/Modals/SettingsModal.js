import React, { useRef ,useState } from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@formsflow/components";
import PropTypes from 'prop-types';

import FormSettings from "../Form/components/FormSettings";
const SettingsModal = ({ show, handleClose, handleConfirm, isSaving = false }) => {
  const { t } = useTranslation();
  const FormSettingsRef = useRef();
  const [ isSaveButtonDisabled ,setIsSaveButtonDisabled] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleConfirmFunction = async () => {
    const { formDetails, validateField } = FormSettingsRef.current;
    const fieldsToValidate = ["title", "path"];
    
    // Reset validation error state at the beginning
    let validationError = false;
  
    for (const field of fieldsToValidate) {
      setIsValidating(true);
      const fieldValue = formDetails?.[field];  
      if (!fieldValue || !(await validateField(field, fieldValue))) {
        validationError = true;
        setIsValidating(false);
        break; // Stop further validation if any field fails
      }
    }
    if (!validationError) {
      setIsValidating(false);
      handleConfirm(FormSettingsRef.current);
    } 
  };
  return (
    <Modal
      className="d-flex flex-column align-items-start w-100 settings-modal"
      show={show}
      onHide={handleClose}
      size="sm"
      backdrop="static"
      centered
      data-testid="settings-modal"
    >
      <Modal.Header>
        <Modal.Title>{t("Settings")}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <FormSettings
          ref={FormSettingsRef}
          handleConfirm={handleConfirm}
          handleClose={handleClose}
          setIsSaveButtonDisabled = {setIsSaveButtonDisabled}
        />
      </Modal.Body>
      <Modal.Footer>
        <CustomButton
          variant="primary"
          size="md"
          disabled={isSaving || isSaveButtonDisabled}
          buttonLoading={isSaving || isValidating}
          label={t("Save Changes")}
          onClick={handleConfirmFunction}
          dataTestId="save-form-settings"
          ariaLabel={t("Save Form Settings")}
        />

        <CustomButton
          variant="secondary"
          size="md"
          label={t("Discard Changes")}
          onClick={handleClose}
          dataTestId="cancel-form-settings"
          ariaLabel={t("Cancel Form Settings")}
        />
      </Modal.Footer>
    </Modal>
  );
};


SettingsModal.propTypes = {
  show: PropTypes.bool,
  handleClose: PropTypes.func.isRequired, 
  handleConfirm: PropTypes.func.isRequired, 
  isSaving: PropTypes.bool,
};
 

export default SettingsModal;
