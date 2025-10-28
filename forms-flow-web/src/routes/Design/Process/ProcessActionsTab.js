import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  CustomProgressBar,
  SelectDropdown,
  V8CustomButton,
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
  const [progress, setProgress] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Export format options based on diagram type
  const formExportOptions = [{ label: diagramLabel, value: "XML" }];

  if (!newActionModal) return null;

  const handleSelectChange = (value) => {
    setSelectedValue(value);
  };

  const handleExportClick = async () => {
    if (!onExport) return;

    setIsExporting(true);
    setProgress(0);
    setIsError(false);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Call the actual export function
      await onExport(selectedValue);

      // Complete progress
      clearInterval(progressInterval);
      setProgress(100);

      // Reset after success
      setTimeout(() => {
        setProgress(0);
        setIsExporting(false);
      }, 1000);
    } catch (error) {
      setIsError(true);
      setProgress(0);
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
