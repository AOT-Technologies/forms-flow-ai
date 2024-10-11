import React from "react";
import Modal from "react-bootstrap/Modal";
import { CloseIcon } from "@formsflow/components";

const CreateFormModal = React.memo(({ newFormModal, onClose, onAction }) => {
    const ActionType = {
        BUILD: "BUILD",
        IMPORT: "IMPORT",
        USE_TEMPLATE: "USE_TEMPLATE",
        USE_AI: "USE_AI"
    };
    return (
        <>
            <Modal show={newFormModal} onHide={onClose} >
                <Modal.Header>
                    <Modal.Title className="modal-headder">
                        <div> Add Form</div>
                    </Modal.Title>
                    <div className="d-flex align-items-center">
                        <CloseIcon width="16.5" height="16.5" onClick={onClose} />
                    </div>
                </Modal.Header>
                <Modal.Body className="create-form-modal-body d-flex justify-content-around">
                    <div className="d-flex flex-wrap">
                        <div className="bg-light text-center content-wrapper" onClick={() => onAction(ActionType.BUILD)}>
                            <span className="Modal-content-heading">Build</span>
                            <span className="modal-content-text">Create the form from scratch</span>
                        </div>
                        <div className="bg-light text-center content-wrapper" onClick={() => onAction(ActionType.IMPORT)}>
                            <span className="Modal-content-heading">Import</span>
                            <span className="modal-content-text">Upload form from a file</span>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
});

export default CreateFormModal;
