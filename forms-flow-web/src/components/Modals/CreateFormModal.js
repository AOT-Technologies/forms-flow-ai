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
        <Modal size="sm" show={newFormModal} onHide={onClose} data-testid="create-form-modal">
                <Modal.Header>
                    <Modal.Title className="modal-headder">
                        <p>{t("Add Form")}</p>
                    </Modal.Title>
                    <div className="icon-close" onClick={onClose}>
                        <CloseIcon data-testid="modal-close-icon" />
                    </div>
                </Modal.Header>
                <Modal.Body className="choice">
                    <button onClick={() => onAction(ActionType.BUILD)}>
                        <h3 data-testid="build-new-form">{t("Build")}</h3>
                        <p>{t("Create the form from scratch")}</p>
                    </button>
                    <button onClick={() => onAction(ActionType.IMPORT)}>
                        <h3 data-testid="import-new-form">{t("Import")}</h3>
                        <p>{t("Upload form from a file")}</p>
                    </button>
                </Modal.Body>
            </Modal>
    );
});

export default CreateFormModal;