import React from "react";
import Modal from "react-bootstrap/Modal";
import PropTypes from "prop-types";
import {
  DuplicateIcon,
  ImportIcon,
  PencilIcon,
  CloseIcon,
  TrashIcon,
  CustomInfo,
  CustomButton,
} from "@formsflow/components";

const ActionModal = React.memo(
  ({
    newActionModal,
    onClose,
    CategoryType,
    onAction,
    published,
    isCreate,
    isMigrated,
    diagramType
  }) => {
    const handleAction = (actionType) => {
      onAction(actionType);
      onClose();
    };
    let customInfo = null;

    if (CategoryType === "FORM" && (published || !isMigrated)) {
      customInfo = {
        heading: "Note",
        content: `
          ${published ? `Importing and deleting is not available when the form is published. You must unpublish the form first if you wish to make any changes.` : ""}
          ${!isMigrated ? "\nSome actions are disabled as this form has not been migrated to the new 1 to 1 relationship structure. To migrate this form exit this popup and click \"Save layout\" or \"Save flow\"." : ""}
        `.trim(),
      };
    } else if (CategoryType === "WORKFLOW" && published) {
      customInfo = {
        heading: "Note",
        content: `Importing is not available when the ${diagramType} is published.` + 
        `You must unpublish the ${diagramType} first if you wish to make any changes.`.trim(),
      

      };
    }
    
    
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
          <Modal.Body className="action-modal-body">
          {customInfo && <CustomInfo heading={customInfo.heading} content={customInfo.content} />}
            {CategoryType === "FORM" && (
              <div className="custom-action-flex action-form">
                <CustomButton
                  variant="secondary"
                  size="sm"
                  label="Duplicate"
                  disabled={!isMigrated}
                  icon={<DuplicateIcon color="#253DF4" />}
                  className=""
                  dataTestid="duplicate-form-button"
                  ariaLabel="Duplicate Button"
                  onClick={() => handleAction("DUPLICATE")}
                />
                <CustomButton
                  variant="secondary"
                  disabled={published || !isMigrated}
                  size="sm"
                  label="Import"
                  icon={<ImportIcon />}
                  className=""
                  dataTestid="import-form-button"
                  ariaLabel="Import Form"
                  onClick={() => handleAction("IMPORT")}
                />

                <CustomButton
                  variant="secondary"
                  size="sm"
                  label="Export"
                  icon={<PencilIcon />}
                  className=""
                  dataTestid="export-form-button"
                  ariaLabel="Export Form"
                  onClick={() => handleAction("EXPORT")}
                />

                <CustomButton
                  variant="secondary"
                  disabled={published}
                  size="sm"
                  label="Delete"
                  icon={<TrashIcon />}
                  className=""
                  dataTestid="delete-form-button"
                  ariaLabel="Delete Form"
                  onClick={() => handleAction("DELETE")}
                />
              </div>
            )}

            {CategoryType === "WORKFLOW" && (
              <div className="d-flex custom-action-flex action-form">
                <CustomButton
                  variant="secondary"
                  size="sm"
                  label="Duplicate"
                  icon={<DuplicateIcon />}
                  className=""
                  dataTestid="duplicate-workflow-button"
                  ariaLabel="Duplicate Workflow"
                  disabled={isCreate}
                  onClick={() => handleAction("DUPLICATE")}
                />

                <CustomButton
                  variant="secondary"
                  disabled={published}
                  size="sm"
                  label="Import"
                  icon={<ImportIcon />}
                  className=""
                  dataTestid="import-workflow-button"
                  ariaLabel="Import Workflow"
                  onClick={() => handleAction("IMPORT")}
                />

                <CustomButton
                  variant="secondary"
                  size="sm"
                  label="Export"
                  icon={<PencilIcon />}
                  className=""
                  dataTestid="export-workflow-button"
                  ariaLabel="Export Workflow"
                  onClick={() => handleAction("EXPORT")}
                />
              </div>
            )}
          </Modal.Body>
        </Modal>
      </>
    );
  }
);

ActionModal.propTypes = {
  newActionModal: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  CategoryType: PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired,
  published: PropTypes.bool.isRequired,
  isCreate: PropTypes.bool,
  isMigrated: PropTypes.bool, // Adding validation for isMigrated
  diagramType: PropTypes.string,
};

export default ActionModal;
