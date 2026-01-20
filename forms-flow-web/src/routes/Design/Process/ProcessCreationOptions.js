import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { push } from "connected-react-router";
import {
  EditPencilIcon,
  BreadCrumbs,
  FileUploadArea,
  useProgressBar,
} from "@formsflow/components";
import {
  navigateToSubflowCreate,
  navigateToDecisionTableCreate,
  navigateToSubflowEdit,
  navigateToDecisionTableEdit,
} from "../../../helper/routerHelper";
import { getRoute } from "../../../constants/constants";
import { createProcess } from "../../../apiManager/services/processServices";
import FileService from "../../../services/FileService";
import { MAX_FILE_SIZE } from "../../../constants/constants";

// Constants
const UPLOAD_PROGRESS_INCREMENT = 5;
const UPLOAD_PROGRESS_INTERVAL = 300;
const INITIAL_UPLOAD_PROGRESS = 10;

const ProcessCreationOptions = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const tenantKey = useSelector((state) => state.tenants?.tenantId);

  // Determine type from URL path
  const type = location.pathname.includes("/subflow/build")
    ? "subflow"
    : "decision-table";

  // State management
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Refs
  const fileInputRef = useRef(null);
  const uploadAreaRef = useRef(null);
  
  // Use progress bar hook for upload progress
  const { progress: uploadProgress, start, stop, complete, reset } = useProgressBar({
    increment: UPLOAD_PROGRESS_INCREMENT,
    interval: UPLOAD_PROGRESS_INTERVAL,
    useCap: false,
    initialProgress: INITIAL_UPLOAD_PROGRESS,
  });

  // Determine process type and configuration
  const isSubflow = type === "subflow";
  const processConfig = isSubflow
    ? {
        name: "Subflow",
        nameKey: "subflow",
        breadcrumbLabel: t("Create a New Sub flow"),
        createText: t("Create a Subflow from scratch"),
        uploadText: t("Upload an existing sub flow"),
        fileExtension: ".bpmn",
        fileType: "text/bpmn",
        dataTestIdPrefix: "subflow",
        ariaLabelPrefix: t("subflow"),
      }
    : {
        name: "Decision Table",
        nameKey: "decision-table",
        breadcrumbLabel: t("Create a New Decision Table"),
        createText: t("Create a decision table from scratch"),
        uploadText: t("Upload an existing decision table"),
        fileExtension: ".dmn",
        fileType: "text/dmn",
        dataTestIdPrefix: "decision-table",
        ariaLabelPrefix: t("decision table"),
      };

  /**
   * Resets the upload state to allow user to retry with a new file
   */
  const resetUploadState = useCallback(() => {
    setIsUploading(false);
    reset();
    setUploadError("");
    setSelectedFile(null);
  }, [reset]);

  /**
   * Validates the uploaded file
   * @param {File} file - The file to validate
   * @returns {string|null} - Error message if validation fails, null otherwise
   */
  const validateFile = useCallback(
    (file) => {
      if (!file) {
        return t("Please select a file to upload");
      }

      if (file.size > MAX_FILE_SIZE) {
        return t(
          "File size exceeds the {{size}}MB limit. Please upload a smaller file.",
          {
            size: MAX_FILE_SIZE / (1024 * 1024),
          }
        );
      }

      const expectedExtension = processConfig.fileExtension;
      if (!file.name.toLowerCase().endsWith(expectedExtension)) {
        return t("Please upload a {{extension}} file", {
          extension: expectedExtension,
        });
      }

      return null;
    },
    [processConfig.fileExtension, t]
  );

  /**
   * Handles file upload process
   * @param {File} file - The file to upload
   */
  const handleFileUpload = useCallback(
    async (file) => {
      if (!file) {
        return;
      }

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      // Initialize upload state
      setSelectedFile(file);
      setUploadError("");
      reset();
      setIsUploading(true);

      try {
        // Extract XML from the uploaded file
        const { xml } = await FileService.extractFileDetails(file);
        if (!xml) {
          throw new Error("Failed to extract XML from file");
        }

        // Create a new process
        const response = await createProcess({ 
          data: xml, 
          type: isSubflow ? "bpmn" : "dmn" 
        });

        if (!response?.data?.processKey) {
          throw new Error("Process key not received from server");
        }

        // Complete upload progress
        complete();

        // Wait for progress bar to show 100% before navigating (allows UI to update)
        setTimeout(() => {
          // Navigate to the appropriate edit page
          if (isSubflow) {
            navigateToSubflowEdit(dispatch, tenantKey, response.data.processKey);
          } else {
            navigateToDecisionTableEdit(dispatch, tenantKey, response.data.processKey);
          }

          // Set loading to false after navigation
          setIsUploading(false);
        }, 500);
      } catch (error) {
        // Set error first to avoid briefly rendering the completed state
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          t("Failed to import {{type}}", {
            type: processConfig.name.toLowerCase(),
          });
        setUploadError(errorMessage);

        // Complete progress after error so UI doesn't flash Done/Cancel
        complete();

        // Wait for progress bar to show 100% before finalizing state
        setTimeout(() => {
          setIsUploading(false);
        }, 500);
      }
    },
    [validateFile, reset, complete, dispatch, isSubflow, processConfig.name, t]
  );

  /**
   * Manages simulated upload progress while awaiting server response
   */
  useEffect(() => {
    if (isUploading) {
      reset();
      start();
    } else {
      stop();
    }

    return () => {
      stop();
    };
  }, [isUploading, start, stop, reset]);

  /**
   * Manages focus on the upload area when an error occurs
   */
  useEffect(() => {
    if (uploadError && uploadAreaRef.current?.focus) {
      uploadAreaRef.current.focus();
    }
  }, [uploadError]);

  /**
   * Handles breadcrumb navigation
   * @param {Object} item - The breadcrumb item clicked
   */
  const handleBreadcrumbClick = useCallback(
    (item) => {
      if (item?.id === "subflows" || item?.id === "decision-tables") {
        // Navigate back to the appropriate process listing page
        const processRoute = isSubflow
          ? getRoute(tenantKey).SUBFLOW
          : getRoute(tenantKey).DECISIONTABLE;
        dispatch(push(processRoute));
      }
    },
    [dispatch, tenantKey, isSubflow]
  );

  /**
   * Handles keyboard navigation for interactive elements
   * @param {KeyboardEvent} event - The keyboard event
   * @param {Function} callback - The callback to execute on Enter or Space
   */
  const handleKeyDown = useCallback((event, callback) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      callback();
    }
  }, []);

  /**
   * Handles create from scratch action
   */
  const handleCreateFromScratch = useCallback(() => {
    if (isSubflow) {
      navigateToSubflowCreate(dispatch, tenantKey);
    } else {
      navigateToDecisionTableCreate(dispatch, tenantKey);
    }
  }, [dispatch, tenantKey, isSubflow]);

  /**
   * Handles file input change
   * @param {Event|File} eventOrFile - The file input change event or file directly
   */
  const handleFileInputChange = useCallback(
    (eventOrFile) => {
      // Handle both event object and direct file
      const file = eventOrFile?.target?.files?.[0] || eventOrFile;
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  /**
   * Handles file drop
   * @param {File} file - The dropped file
   */
  const handleFileDrop = useCallback(
    (file) => {
      handleFileUpload(file);
    },
    [handleFileUpload]
  );

  // Breadcrumb configuration
  const breadcrumbItems = [
    { 
      id: isSubflow ? "subflows" : "decision-tables", 
      label: isSubflow ? t("Subflows") : t("Decision Tables"),
      href: getRoute(tenantKey)[isSubflow ? "SUBFLOW" : "DECISIONTABLE"]
    },
    { 
      id: "create-new", 
      label: isSubflow ? t("Create a New Subflow") : t("Create a New Decision Table")
    },
  ];

  return (
    <>
      <div className="header-section-1">
        <div className="section-seperation-left d-block">
          <BreadCrumbs
            items={breadcrumbItems}
            onBreadcrumbClick={handleBreadcrumbClick}
          />
        </div>
      </div>

      <div className="body-section">
        <div 
          className="process-create-cards"
          data-test-id={`${processConfig.dataTestIdPrefix}-creation-options`}
        >
          {/* Create Something New Section */}
          <div
            className="settings-header"
            aria-label={t("Create Something New")}
            data-test-id={`create-something-new-${processConfig.dataTestIdPrefix}-header`}
          >
            {t("Create Something New")}
          </div>
          <div className="create-from-scratch">
          <div
              className="grid-item"
              onClick={handleCreateFromScratch}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, handleCreateFromScratch)}
              aria-label={t(
                "Create a {{type}} from scratch using Form Builder",
                { type: processConfig.ariaLabelPrefix }
              )}
              data-test-id={`create-${processConfig.dataTestIdPrefix}-from-scratch-button`}
            >
              <div className="card-text">
                <EditPencilIcon />
                {processConfig.createText}
              </div>
            </div>
          </div>

          {/* Upload Existing Process Section */}
          <div
            className="settings-header"
            aria-label={processConfig.uploadText}
            data-test-id={`upload-existing-${processConfig.dataTestIdPrefix}-header`}
          >
            {processConfig.uploadText}
          </div>
          <div className="create-from-process">
          <FileUploadArea
              ref={uploadAreaRef}
              onFileDrop={handleFileDrop}
              onFileSelect={handleFileInputChange}
              accept={processConfig.fileExtension}
              fileType={processConfig.fileExtension}
              file={selectedFile}
              progress={uploadProgress}
              error={uploadError}
              onRetry={resetUploadState}
              onCancel={resetUploadState}
              onDone={resetUploadState}
              primaryButtonText={t("Done")}
              className="grid-item"
              dataTestId={`upload-${processConfig.dataTestIdPrefix}-area`}
              ariaLabel={t(
                "Drag and drop a {{extension}} file or click to browse for {{type}}",
                { 
                  extension: processConfig.fileExtension,
                  type: processConfig.ariaLabelPrefix
                }
              )}
              maxFileSizeMB={MAX_FILE_SIZE / (1024 * 1024)}
            />
          </div>

        </div>
        
        {/* Hidden file input for programmatic file selection */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept={processConfig.fileExtension} 
          style={{ display: "none" }} 
          data-test-id={`hidden-${processConfig.dataTestIdPrefix}-file-input`}
          aria-label={t("Hidden file input for {{type}}", { type: processConfig.ariaLabelPrefix })}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileUpload(file);
            }
          }}
          tabIndex={-1}
        />
      </div>
    </>
  );
};

export default ProcessCreationOptions;
