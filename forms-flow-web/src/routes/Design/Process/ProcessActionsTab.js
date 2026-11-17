import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  CustomProgressBar,
  SelectDropdown,
  V8CustomButton,
  useProgressBar,
} from "@formsflow/components";
// import { StyleServices } from "@formsflow/service";

// A lightweight, inline Actions panel rendered as a tab instead of a modal.
const ProcessActionsTab = ({
  newActionModal,
  renderUpload,
  onExport,
  diagramType,
}) => {
  const { t } = useTranslation();
  //   const primaryColor = StyleServices.getCSSVariable("--ff-primary");

  // Get diagram-specific labels
  const diagramLabel = diagramType || "Process";

  // State for export functionality
  const [selectedValue, setSelectedValue] = useState("XML");
  const [isError, setIsError] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Use progress bar hook for export progress
  const { progress, start, complete, reset } = useProgressBar({
    increment: 10,
    interval: 200,
    useCap: true,
    capProgress: 90,
  });

  // Export format options based on diagram type
  const formExportOptions = [{ label: diagramLabel, value: "XML" }];

  if (!newActionModal) return null;

  const handleSelectChange = (value) => {
    setSelectedValue(value);
  };

  const handleExportClick = async () => {
    if (!onExport) return;

    setIsExporting(true);
    reset();
    setIsError(false);

    try {
      // Start progress simulation
      start();

      // Call the actual export function
      await onExport(selectedValue);

      // Complete progress
      complete();

      // Reset after success
      setTimeout(() => {
        reset();
        setIsExporting(false);
      }, 1000);
    } catch (error) {
      setIsError(true);
      reset();
      setIsExporting(false);
    }
  };

  return (
    <div className="process-actions-tab" data-testid="process-actions-tab">
      <div className="grid-section">
        <div className="actions-header">{t(`Import ${diagramLabel}`)}</div>
        <div className="upload-action-content">
          {renderUpload && renderUpload()}
        </div>
      </div>
      <div className="grid-section">
        <div className="actions-header">{t(`Export ${diagramLabel}`)}</div>
        <div className="actions-contents">
          <div className="export-section">
            <div className="export-dropdown-section">
              <SelectDropdown
                options={formExportOptions}
                value={selectedValue}
                onChange={handleSelectChange}
                searchDropdown={false}
                ariaLabel={t("Select export format")}
                dataTestId="form-export-dropdown"
                variant="primary"
              />
              <V8CustomButton
                variant="primary"
                onClick={handleExportClick}
                data-testid="form-export-btn"
                aria-label={t(`Export ${diagramLabel}`)}
                label={t("Export")}
                disabled={isExporting}
                loading={isExporting}
              />
            </div>
            {isExporting && (
              <div className="export-progress-section">
                <div>
                  {t("Export process as")} {selectedValue}
                </div>
                <div className="export-progress">
                  <CustomProgressBar
                    progress={progress}
                    color={isError ? "error" : undefined}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ProcessActionsTab.propTypes = {
  newActionModal: PropTypes.bool.isRequired,
  diagramType: PropTypes.string,
  renderUpload: PropTypes.func,
  onExport: PropTypes.func,
};

export default ProcessActionsTab;
