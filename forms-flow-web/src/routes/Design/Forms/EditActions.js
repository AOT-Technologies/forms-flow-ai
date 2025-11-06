import React, { useState, useRef } from "react";
import { getFormExport } from "../../../apiManager/services/FormServices";
import _ from "lodash";
import {
  V8CustomButton,
  SelectDropdown,
  CustomProgressBar,
} from "@formsflow/components";

const ActionsPage = ({ renderUpload, renderDeleteForm, mapperId, formTitle }) => {
  const [progress, setProgress] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const formExportOptions = [
    { label: "JSON", value: "json" }
  ];
  const [selectedValue, setSelectedValue] = useState("json");
  const [showProgress, setShowProgress] = useState(false);
  const uploadContentRef = useRef(null);

  const handleSelectChange = (value) => {
    setSelectedValue(value);
  };


  const fileName = `${_.camelCase(formTitle)}.json`;

  const exportForm = () => {
    setProgress(1);
    setIsError(false);
    setIsExporting(true);

    // Fallback progress simulation in case real progress doesn't fire
    let progressInterval = null;
    const startProgressSimulation = () => {
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90; // Cap at 90% until real download completes
          }
          return prev + 5; // Increment by 5%
        });
      }, 150);
    };
    startProgressSimulation();

    getFormExport(mapperId, {
      responseType: "blob",
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      },
    })
      .then((response) => {
        // Clear the simulation interval
        if (progressInterval) {
          clearInterval(progressInterval);
        }

        const jsonString = JSON.stringify(response.data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setProgress(100);
        
        // Wait a bit before hiding the progress bar to show completion
        setTimeout(() => {
          setIsExporting(false);
        }, 500);
      })
      .catch(() => {
        // Clear the simulation interval
        if (progressInterval) {
          clearInterval(progressInterval);
        }

        setProgress(100);
        setIsError(true);
      })
      .finally (() => {
        setTimeout(() => setShowProgress(false), 3000);
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
            <div>Exporting PDF</div>
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