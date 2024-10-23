import React from "react";
import Modal from "react-bootstrap/Modal";
import { CustomButton } from "@formsflow/components";
import { DuplicateIcon, ImportIcon, PencilIcon, SaveTemplateIcon, CloseIcon } from "@formsflow/components";

const ActionModal = React.memo(({ newActionModal, onClose, CategoryType, onAction  }) => {
      const handleAction = (actionType)=>{
        onAction(actionType);
        onClose();
      };
      
    return (
        <>
            <Modal show={newActionModal} onHide={onClose} centered={true} size="sm">
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
                                onClick={() => handleAction("DUPLICATE")}
                            />

                            <CustomButton
                                variant="secondary"
                                size="sm"
                                label="Save as template"
                                icon={<SaveTemplateIcon color="#253DF4" />}
                                className=""
                                dataTestid="save-template-button"
                                ariaLabel="Save as Template"
                                onClick={() => handleAction("SAVE_AS_TEMPLATE")}
                            />
                            <CustomButton
                                variant="secondary"
                                size="sm"
                                label="Import"
                                icon={<ImportIcon color="#253DF4" />}
                                className=""
                                dataTestid="import-form-button"
                                ariaLabel="Import Form"
                                onClick={() => handleAction("IMPORT")}
                            />

                            <CustomButton
                                variant="secondary"
                                size="sm"
                                label="Export"
                                icon={<PencilIcon color="#253DF4" />}
                                className=""
                                dataTestid="export-form-button"
                                ariaLabel="Export Form"
                                onClick={() => handleAction("EXPORT")}
                            />

                            <CustomButton
                                variant="secondary"
                                size="sm"
                                label="Delete"
                                icon={<CloseIcon color="#253DF4" />}
                                className=""
                                dataTestid="delete-form-button"
                                ariaLabel="Delete Form"
                                onClick={() => handleAction("DELETE")}
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
                                    onClick={() => handleAction("DUPLICATE")}
                                />
                            
                           
                                <CustomButton
                                    variant="secondary"
                                    size="sm"
                                    label="Import"
                                    icon={<ImportIcon color="#253DF4" />}
                                    className=""
                                    dataTestid="import-workflow-button"
                                    ariaLabel="Import Workflow"
                                    onClick={() => handleAction("IMPORT")}
                                />
                            
                           
                                <CustomButton
                                    variant="secondary"
                                    size="sm"
                                    label="Export"
                                    icon={<PencilIcon color="#253DF4" />}
                                    className=""
                                    dataTestid="export-workflow-button"
                                    ariaLabel="Export Workflow"
                                    onClick={() => handleAction("EXPORT")}
                                />
                           <CustomButton
                                    variant="secondary"
                                    size="sm"
                                    label="Delete"
                                    icon={<CloseIcon color="#253DF4" />}
                                    className=""
                                    dataTestid="delete-workflow-button"
                                    ariaLabel="Delete Workflow"
                                    onClick={() => handleAction("DELETE")}
                                />
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
});

export default ActionModal;
