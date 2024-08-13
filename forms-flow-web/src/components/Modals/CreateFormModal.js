import React from "react";
import Modal from "react-bootstrap/Modal";
import "./Modal.scss";

const CreateFormModal = React.memo(({ newFormModal, onClose, onAction }) => {
    return (
        <>
            <Modal show={newFormModal} onHide={onClose} >
                <Modal.Header>
                    <Modal.Title className="modal-headder">
                        <div> Add Form</div>
                    </Modal.Title>
                    <div className="d-flex align-items-center">
                        <button
                            type="button"
                            className="close-modal"
                            onClick={onClose}
                            aria-label="close New Form Modal"
                            data-testid="close-new-form-modal"
                        >
                            X
                        </button>
                    </div>
                </Modal.Header>
                <Modal.Body className="create-form-modal-body d-flex justify-content-around">
                    <div className="d-flex flex-wrap">
                        <div className="border bg-light text-center inner-div" onClick={() => onAction("BUILD")}>
                            <span className="Modal-content-heading">Build</span>
                            <span className="modal-content-text">Create the form from scratch</span>
                        </div>
                        <div className="border bg-light text-center inner-div" onClick={() => onAction("IMPORT")}>
                            <span className="Modal-content-heading">Import</span>
                            <span className="modal-content-text">Upload form from a file</span>
                        </div>
                            {/* <div className="border bg-light text-center inner-div" onClick={() => onAction('USE_TEMPLATE')}>
                                <span className="Modal-content-heading">Use Template</span>
                                <span className="modal-content-text">Start off from a template</span>
                            </div>
                            <div className="border bg-light text-center inner-div" onClick={() => onAction('USE_AI')}>
                                <span className="Modal-content-heading">Use AI</span>
                                <span className="modal-content-text">Build form using Flow-E AI chatbot</span>
                            </div> */}
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
});

export default CreateFormModal;
