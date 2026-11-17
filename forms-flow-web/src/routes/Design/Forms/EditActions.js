import React, { useState, useRef } from "react";
import { getFormExport } from "../../../apiManager/services/FormServices";
import _ from "lodash";
import {
  V8CustomButton,
  SelectDropdown,
  CustomProgressBar,
  useProgressBar,
} from "@formsflow/components";

const ActionsPage = ({ renderUpload, renderDeleteForm, mapperId, formTitle }) => {
  const [isError, setIsError] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const formExportOptions = [
    { label: "JSON", value: "json" }
  ];
  const [selectedValue, setSelectedValue] = useState("json");
  const [showProgress, setShowProgress] = useState(false);
  const uploadContentRef = useRef(null);
  
  // Use progress bar hook for export progress
  const { progress, start, stop, complete, setProgress, reset } = useProgressBar({
    increment: 5,
    interval: 150,
    useCap: true,
    capProgress: 90,
    initialProgress: 1,
  });

  const handleSelectChange = (value) => {
    setSelectedValue(value);
  };


  const fileName = `${_.camelCase(formTitle)}.json`;

  const exportForm = () => {
    reset();
    setProgress(1);
    setIsError(false);
    setIsExporting(true);

    // Start fallback progress simulation
    start();

    getFormExport(mapperId, {
      responseType: "blob",
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted); // Override with real progress
        }
      },
    })
      .then((response) => {
        // Stop the simulation
        stop();

        const jsonString = JSON.stringify(response.data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        complete();
        
        // Wait a bit before hiding the progress bar to show completion
        setTimeout(() => {
          setIsExporting(false);
        }, 500);
      })
      .catch(() => {
        // Stop the simulation
        stop();

        complete();
        setIsError(true);
      })
      .finally (() => {
        setTimeout(() => {
          setShowProgress(false);
          reset();
        }, 3000);
      });
  };

  const handleExportClick = () => {
    setShowProgress(true);
    exportForm();
  };

  const handleUploadAreaClick = (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.closest('button')) {
      return;
    }
    const uploadArea = uploadContentRef.current;
    if (uploadArea) {
      const fileInput = uploadArea.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.click();
      }
    }
  };

  return (
    <div className="form-edit-actions">
      <div className="grid-section">
        <div className="actions-header">Import Form</div>
        <div 
          className="upload-action-content" 
          ref={uploadContentRef}
          onClick={handleUploadAreaClick}
          style={{ cursor: 'pointer' }}
        >
          {renderUpload && renderUpload() }
        </div>
      </div>

      <div className="grid-section">
        <div className="actions-header">Export Form</div>
        <div className="actions-contents">
        <div className="export-section">
            <div className="export-dropdown-section">
            <SelectDropdown
              options={formExportOptions}
              value={selectedValue}
              onChange={handleSelectChange}
              searchDropdown={false}
              ariaLabel="Select export format"
              dataTestId="form-export-dropdown"
            />
          <V8CustomButton
            variant="primary"
             onClick= {handleExportClick}
            disabled={isExporting}
            data-testid="form-export-btn"
            aria-label="Export Form"
            label="Export"
        />
     </div>

     {showProgress && <div className="export-progress-section">
            <div>Exporting JSON</div>
            <div className="export-progress">
            <CustomProgressBar 
              progress={progress} 
              color={isError ? "error" : undefined}
            />
            </div>
     </div>}
     
      </div>
          </div>
      </div>

      <div className="grid-section">
        <div className="actions-header">
          <div className="delete-header">Delete Form</div>
        </div>
        <div className="actions-contents">
          {renderDeleteForm && renderDeleteForm()}
        </div>
      </div>
    </div>
  );
};

export default ActionsPage;