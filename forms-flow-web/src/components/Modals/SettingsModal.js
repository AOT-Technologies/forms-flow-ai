import React, { useRef ,useState } from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@formsflow/components";
import PropTypes from 'prop-types';
import userRoles from "../../constants/permissions";

import FormSettings from "../Form/components/FormSettings";
const SettingsModal = ({ show, handleClose, handleConfirm, isSaving = false }) => {
  const { t } = useTranslation();
  const FormSettingsRef = useRef();
  const [ isSaveButtonDisabled ,setIsSaveButtonDisabled] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { createDesigns } = userRoles();
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
      className="settings-modal"
      show={show}
      onHide={handleClose}
      size="sm"
      backdrop="static"
      data-testid="settings-modal"
    >
      <Modal.Header>
        <Modal.Title><p>{t("Settings")}</p></Modal.Title>
      </Modal.Header>
      <Modal.Body className="with-tabs">
        <FormSettings
          ref={FormSettingsRef}
          handleConfirm={handleConfirm}
          handleClose={handleClose}
          setIsSaveButtonDisabled = {setIsSaveButtonDisabled}
        />
      </Modal.Body>
      <Modal.Footer>
        <div className="buttons-row">
          {createDesigns && <CustomButton
            disabled={isSaving || isSaveButtonDisabled}
            buttonLoading={isSaving || isValidating}
            label={t("Save Changes")}
            onClick={handleConfirmFunction}
            dataTestId="save-form-settings"
            ariaLabel={t("Save Form Settings")}
          />}

          <CustomButton
            label={t("Discard Changes")}
            onClick={handleClose}
            dataTestId="cancel-form-settings"
            ariaLabel={t("Cancel Form Settings")}
            secondary
          />
        </div>
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
