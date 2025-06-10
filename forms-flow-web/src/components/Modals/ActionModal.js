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
import { StyleServices } from "@formsflow/service";
import { useTranslation } from "react-i18next";
import userRoles from "../../constants/permissions";
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
    const { t } = useTranslation();
    const primaryColor = StyleServices.getCSSVariable('--ff-primary');
    const { viewDesigns} = userRoles();
    const handleAction = (actionType) => {
      onAction(actionType);
      onClose();
    };
    let customInfo = null;

    if (CategoryType === "FORM" && (published || !isMigrated)) {
      customInfo = {
        heading: t("Note"),
        content: `
          ${published ? t("Importing and deleting is not available when the form is published. You must unpublish the form first if you wish to make any changes.") : ""}
          ${!isMigrated ? "\nSome actions are disabled as this form has not been migrated to the new 1 to 1 relationship structure. To migrate this form exit this popup and click \"Save layout\" or \"Save flow\"." : ""}
        `.trim(),
      };
    } else if (CategoryType === "WORKFLOW" && published) {
      customInfo = {
        heading: t("Note"),
        content: t(
          "Importing is not available when the {{type}} is published. You must unpublish the {{type}} first if you wish to make any changes.",
          { type: diagramType }
        ).trim(),


      };
    }


    return (
      <>
        <Modal show={newActionModal} onHide={onClose} centered={true} size="sm" data-testid="action-modal">
          <Modal.Header>
            <Modal.Title className="modal-headder">
              <div>{t("Action")}</div>
            </Modal.Title>
            <div className="d-flex align-items-center">
              <CloseIcon onClick={onClose} color={primaryColor}  dataTestId="action-modal-close"/>
            </div>
          </Modal.Header>
          <Modal.Body className="action-modal-body">
          {customInfo && <CustomInfo heading={customInfo.heading} content={customInfo.content} />}
            {CategoryType === "FORM" && (
              <div className="custom-action-flex action-form">
                <CustomButton
                  variant="secondary"
                  size="sm"
                  label={t("Duplicate")}
                  disabled={!isMigrated || viewDesigns  }
                  icon={<DuplicateIcon color={primaryColor} />}
                  className=""
                  dataTestId="duplicate-form-button"
                  ariaLabel="Duplicate Button"
                  onClick={() => handleAction("DUPLICATE")}
                />
                <CustomButton
                  variant="secondary"
                  disabled={published || !isMigrated || viewDesigns}
                  size="sm"
                  label={t("Import")}
                  icon={<ImportIcon disabled={published} />}
                  className=""
                  dataTestId="import-form-button"
                  ariaLabel="Import Form"
                  onClick={() => handleAction("IMPORT")}
                />

                <CustomButton
                  variant="secondary"
                  size="sm"
                  label={t("Export")}
                  icon={<PencilIcon />}
                  className=""
                  dataTestId="export-form-button"
                  ariaLabel="Export Form"
                  onClick={() => handleAction("EXPORT")}
                />

                <CustomButton
                  variant="secondary"
                  disabled={published || viewDesigns}
                  size="sm"
                  label={t("Delete")}
                  icon={<TrashIcon disabled={published} />}
                  className=""
                  dataTestId="delete-form-button"
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
                  label={t("Duplicate")}
                  icon={<DuplicateIcon />}
                  className=""
                  dataTestId="duplicate-workflow-button"
                  ariaLabel="Duplicate Workflow"
                  disabled={isCreate}
                  onClick={() => handleAction("DUPLICATE")}
                />

                <CustomButton
                  variant="secondary"
                  disabled={published}
                  size="sm"
                  label={t("Import")}
                  icon={<ImportIcon disabled={published}  />}
                  className=""
                  dataTestId="import-workflow-button"
                  ariaLabel="Import Workflow"
                  onClick={() => handleAction("IMPORT")}
                />

                <CustomButton
                  variant="secondary"
                  size="sm"
                  label={t("Export")}
                  icon={<PencilIcon />}
                  className=""
                  dataTestId="export-workflow-button"
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
