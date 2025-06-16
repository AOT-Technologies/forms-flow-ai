import React from "react";
import Modal from "react-bootstrap/Modal";
import PropTypes from "prop-types";
import {
  DuplicateIcon,
  ImportIcon,
  ExportIcon,
  CloseIcon,
  TrashIcon,
  CustomInfo,
  CustomButton,
} from "@formsflow/components";
import { StyleServices } from "@formsflow/service";
import { useTranslation } from "react-i18next";

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
        <Modal show={newActionModal} onHide={onClose} size="sm" data-testid="action-modal">
          <Modal.Header>
            <Modal.Title className="modal-headder">
              <p>{t("Actions")}</p>
            </Modal.Title>
            <div className="icon-close" onClick={onClose}>
              <CloseIcon dataTestId="action-modal-close"/>
            </div>
          </Modal.Header>

          <Modal.Body className="action-modal-body">
            {customInfo && <CustomInfo heading={customInfo.heading} content={customInfo.content} />}

            {CategoryType === "FORM" && (
              <div className="buttons-row">
                <CustomButton
                  label={t("Duplicate")}
                  disabled={!isMigrated}
                  icon={<DuplicateIcon color={primaryColor} />}
                  className=""
                  dataTestId="duplicate-form-button"
                  ariaLabel="Duplicate Button"
                  onClick={() => handleAction("DUPLICATE")}
                  iconWithText
                />
                <CustomButton
                  disabled={published || !isMigrated}
                  label={t("Import")}
                  icon={<ImportIcon disabled={published} />}
                  dataTestId="import-form-button"
                  ariaLabel="Import Form"
                  onClick={() => handleAction("IMPORT")}
                  iconWithText
                />

                <CustomButton
                  label={t("Export")}
                  icon={<ExportIcon />}
                  dataTestId="export-form-button"
                  ariaLabel="Export Form"
                  onClick={() => handleAction("EXPORT")}
                  iconWithText
                />

                <CustomButton
                  disabled={published}
                  label={t("Delete")}
                  icon={<TrashIcon disabled={published} />}
                  dataTestId="delete-form-button"
                  ariaLabel="Delete Form"
                  onClick={() => handleAction("DELETE")}
                  iconWithText
                />
              </div>
            )}

            {CategoryType === "WORKFLOW" && (
              <div className="buttons-row">
                <CustomButton
                  label={t("Duplicate")}
                  icon={<DuplicateIcon />}
                  dataTestId="duplicate-workflow-button"
                  ariaLabel="Duplicate Workflow"
                  disabled={isCreate}
                  onClick={() => handleAction("DUPLICATE")}
                  iconWithText
                />

                <CustomButton
                  disabled={published}
                  label={t("Import")}
                  icon={<ImportIcon disabled={published}  />}
                  dataTestId="import-workflow-button"
                  ariaLabel="Import Workflow"
                  onClick={() => handleAction("IMPORT")}
                  iconWithText
                />

                <CustomButton
                  label={t("Export")}
                  icon={<ExportIcon />}
                  dataTestId="export-workflow-button"
                  ariaLabel="Export Workflow"
                  onClick={() => handleAction("EXPORT")}
                  iconWithText
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
