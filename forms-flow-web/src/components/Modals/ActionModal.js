import React from "react";
import Modal from "react-bootstrap/Modal";
import { CustomButton } from "@formsflow/components";
import { DuplicateIcon, ImportIcon, PencilIcon, SaveTemplateIcon, CloseIcon } from "@formsflow/components";

const ActionModal = React.memo(({ newActionModal, onClose, CategoryType }) => {
    return (
        <>
            <Modal show={newActionModal} onHide={onClose} dialogClassName="modal-50w">
                <Modal.Header>
                    <Modal.Title className="modal-headder">
                        <div> Action</div>
                    </Modal.Title>
                    <div className="d-flex align-items-center">
                    <CloseIcon onClick={onClose} color="#253DF4" />
                    </div>
                </Modal.Header>
                <Modal.Body className="modal-body d-flex justify-content-around custom-modal-body">
                    {CategoryType === "FORM" && (
                        <div className="d-flex custom-action-flex action-form">

                            <CustomButton
                                variant="secondary"
                                size="sm"
                                label="Duplicate"
                                icon={<DuplicateIcon color="#253DF4" />}
                                className=""
                                dataTestid="duplicate-form-button"
                                ariaLabel="Duplicate Button"
                            />

                            <CustomButton
                                variant="secondary"
                                size="sm"
                                label="Save as template"
                                icon={<SaveTemplateIcon color="#253DF4" />}
                                className=""
                                dataTestid="save-template-button"
                                ariaLabel="Save as Template"
                            />
                            <CustomButton
                                variant="secondary"
                                size="sm"
                                label="Import"
                                icon={<ImportIcon color="#253DF4" />}
                                className=""
                                dataTestid="import-form-button"
                                ariaLabel="Import Form"
                            />

                            <CustomButton
                                variant="secondary"
                                size="sm"
                                label="Export"
                                icon={<PencilIcon color="#253DF4" />}
                                className=""
                                dataTestid="export-form-button"
                                ariaLabel="Export Form"
                            />

                            <CustomButton
                                variant="secondary"
                                size="sm"
                                label="Delete"
                                icon={<CloseIcon color="#253DF4" />}
                                className=""
                                dataTestid="delete-form-button"
                                ariaLabel="Delete Form"
                            />

                        </div>
                    )}


                    {CategoryType === "WORKFLOW" && (
                        <div className="d-flex custom-action-flex action-workflow">
                           
                                <CustomButton
                                    variant="secondary"
                                    size="sm"
                                    label="Duplicate"
                                    icon={<DuplicateIcon color="#253DF4" />}
                                    className=""
                                    dataTestid="duplicate-workflow-button"
                                    ariaLabel="Duplicate Workflow"
                                />
                            
                           
                                <CustomButton
                                    variant="secondary"
                                    size="sm"
                                    label="Import"
                                    icon={<ImportIcon color="#253DF4" />}
                                    className=""
                                    dataTestid="import-workflow-button"
                                    ariaLabel="Import Workflow"
                                />
                            
                           
                                <CustomButton
                                    variant="secondary"
                                    size="sm"
                                    label="Export"
                                    icon={<PencilIcon color="#253DF4" />}
                                    className=""
                                    dataTestid="export-workflow-button"
                                    ariaLabel="Export Workflow"
                                />
                           
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
});

export default ActionModal;
