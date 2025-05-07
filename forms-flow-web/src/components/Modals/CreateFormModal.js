import React from "react";
import Modal from "react-bootstrap/Modal";
import { CloseIcon } from "@formsflow/components";
import { useTranslation } from "react-i18next";

const CreateFormModal = React.memo(({ newFormModal, onClose, onAction }) => {
    const { t } = useTranslation();
    const ActionType = {
        BUILD: "BUILD",
        IMPORT: "IMPORT",
        USE_TEMPLATE: "USE_TEMPLATE",
        USE_AI: "USE_AI"
    };
    return (
        <Modal show={newFormModal} onHide={onClose} centered={true} data-testid="create-form-modal" >
                <Modal.Header>
                    <Modal.Title className="modal-headder">
                        <p>{t("Add Form")}</p>
                    </Modal.Title>
                    <div className="icon-close" onClick={onClose}>
                        <CloseIcon data-testid="modal-close-icon" />
                    </div>
                </Modal.Header>
                <Modal.Body className="create-form-modal-body d-flex justify-content-around">
                    <div className="content-wrapper" onClick={() => onAction(ActionType.BUILD)}>
                        <span className="modal-content-heading">{t("Build")}</span>
                        <span className="modal-content-text">{t("Create the form from scratch")}</span>
                    </div>
                    <div className="content-wrapper" onClick={() => onAction(ActionType.IMPORT)}>
                        <span className="modal-content-heading">{t("Import")}</span>
                        <span className="modal-content-text">{t("Upload form from a file")}</span>
                    </div>
                </Modal.Body>
            </Modal>
    );
});

export default CreateFormModal;