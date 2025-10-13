import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  EditPencilIcon,
  //AiIcon,
  BreadCrumbs,
  FileUploadArea,
} from "@formsflow/components";
import {
  navigateToDesignFormEdit,
  navigateToDesignFormsListing,
  navigateToDesignFormCreate,
} from "../../../helper/routerHelper";
import { formImport } from "../../../apiManager/services/FormServices";
import { MAX_FILE_SIZE } from "../../../constants/constants";

// Constants
const UPLOAD_PROGRESS_INCREMENT = 5;
const UPLOAD_PROGRESS_INTERVAL = 300;
const INITIAL_UPLOAD_PROGRESS = 10;
const COMPLETE_PROGRESS = 100;

const CreateFormPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const tenantKey = useSelector((state) => state.tenants?.tenantId);

  // State management
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  // Refs
  const fileInputRef = useRef(null);
  const uploadTimerRef = useRef(null);
  const uploadAreaRef = useRef(null);

  /**
   * Resets the upload state to allow user to retry with a new file
   */
  const resetUploadState = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError("");
    setSelectedFile(null);
  }, []);

  /**
   * Clears the upload timer if it exists
   */
  const clearUploadTimer = useCallback(() => {
    if (uploadTimerRef.current) {
      clearInterval(uploadTimerRef.current);
      uploadTimerRef.current = null;
    }
  }, []);

  /**
   * Validates the uploaded file
   * @param {File} file - The file to validate
   * @returns {string|null} - Error message if validation fails, null otherwise
   */
  const validateFile = useCallback((file) => {
    if (file.size > MAX_FILE_SIZE) {
      return t("File size exceeds the {{size}}MB limit. Please upload a smaller file.", {
        size: MAX_FILE_SIZE / (1024 * 1024),
      });
    }

    if (!file.name.endsWith(".json")) {
      return t("Please upload a valid .json file");
    }

    return null;
  }, [t]);

  /**
   * Handles navigation to create a form from scratch
   */
  const handleCreateFromScratch = useCallback(() => {
    navigateToDesignFormCreate(dispatch, tenantKey);
  }, [dispatch, tenantKey]);

  /**
   * Handles AI-powered form creation
   * TODO: Implement AI form creation functionality
   */
  // const handleAICreate = useCallback(() => {
  //   // AI form creation coming soon
  //   console.log("AI form creation requested");
  // }, []);

  /**
   * Handles file upload and form import
   * @param {File} file - The file to upload
   */
  const handleFileUpload = useCallback(async (file) => {
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
    setUploadProgress(INITIAL_UPLOAD_PROGRESS);
    setIsUploading(true);

    try {
      const importData = { 
        importType: "new", 
        action: "import" 
      };
      const response = await formImport(file, JSON.stringify(importData));
      const formId = response?.data?.mapper?.formId;

      if (!formId) {
        throw new Error("Form ID not received from server");
      }

      // Complete upload progress and navigate
      setUploadProgress(COMPLETE_PROGRESS);
      clearUploadTimer();
      navigateToDesignFormEdit(dispatch, tenantKey, formId);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          t("Failed to import form");
      setUploadError(errorMessage);
      setIsUploading(false);
    }
  }, [validateFile, clearUploadTimer, dispatch, tenantKey, t]);

  /**
   * Manages simulated upload progress while awaiting server response
   */
  useEffect(() => {
    if (isUploading) {
      clearUploadTimer();
      
      uploadTimerRef.current = setInterval(() => {
        setUploadProgress((prevProgress) => {
          const nextProgress = prevProgress + UPLOAD_PROGRESS_INCREMENT;
          return nextProgress >= COMPLETE_PROGRESS ? COMPLETE_PROGRESS : nextProgress;
        });
      }, UPLOAD_PROGRESS_INTERVAL);
    } else {
      clearUploadTimer();
    }

    return () => {
      clearUploadTimer();
    };
  }, [isUploading, clearUploadTimer]);

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
  const handleBreadcrumbClick = useCallback((item) => {
    if (item?.id === "build") {
      navigateToDesignFormsListing(dispatch, tenantKey);
    }
  }, [dispatch, tenantKey]);

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

  // Breadcrumb configuration
  const breadcrumbItems = [
    { id: "build", label: t("Build") },
    { id: "form-title", label: t("Create a New Form") },
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
        <div className="form-create-cards">
          {/* Create Something New Section */}
          <div
            className="settings-header"
            aria-label={t("Create Something New")}
            data-test-id="create-something-new-header"
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
              aria-label={t("Create a form or flow from scratch using Form Builder")}
              data-test-id="create-form-button"
            >
              <div className="card-text">
                <EditPencilIcon />
                {t("Create a form or flow from")}
                <br />
                {t("scratch using Form Builder")}
              </div>
            </div>
           {/* Enterprise feature - to be enabled with feature flag */}
            {/* <div
              className="grid-item"
              onClick={handleAICreate}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, handleAICreate)}
              aria-label={t("Create Using AI")}
              data-test-id="create-using-ai-button"
            >
              <div className="card-text">
                <AiIcon />
                {t("Use AI to help you")}
                <br />
                {t("instantly create a form")}
              </div>
            </div> */}
          </div>

          {/* Upload Existing Form Section */}
          <div
            className="settings-header"
            aria-label={t("Upload an existing form")}
            data-test-id="upload-existing-header"
          >
            {t("Upload an existing form")}
          </div>
          <div className="create-from-form">
            <FileUploadArea
              ref={uploadAreaRef}
              fileType=".json"
              onFileSelect={handleFileUpload}
              onCancel={resetUploadState}
              onRetry={resetUploadState}
              onDone={resetUploadState}
              file={selectedFile}
              progress={isUploading ? uploadProgress : selectedFile ? COMPLETE_PROGRESS : 0}
              error={uploadError}
              ariaLabel={t("Upload .json file area")}
              dataTestId="form-upload-area"
              className="grid-item"
              maxFileSizeMB={MAX_FILE_SIZE / (1024 * 1024)}
            />
          </div>

          {/* Template Section */}
          {/* Enterprise feature - to be enabled with feature flag */}
          {/* <div
            className="create-header"
            aria-label={t("Use a Template")}
            data-test-id="use-template-header"
          >
            {t("Use a Template")}
          </div>
          <div className="create-from-template">
            <div
              className="grid-item"
              role="button"
              tabIndex={0}
              aria-label={t("Template 1")}
              data-test-id="template-card-1"
              onKeyDown={(e) => handleKeyDown(e, () => {})}
            />
            <div
              className="grid-item"
              role="button"
              tabIndex={0}
              aria-label={t("Template 2")}
              data-test-id="template-card-2"
              onKeyDown={(e) => handleKeyDown(e, () => {})}
            />
            <div
              className="grid-item"
              role="button"
              tabIndex={0}
              aria-label={t("Template 3")}
              data-test-id="template-card-3"
              onKeyDown={(e) => handleKeyDown(e, () => {})}
            />
          </div> */}
        </div>
        
        {/* Hidden file input for programmatic file selection */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept=".json" 
          style={{ display: "none" }} 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileUpload(file);
            }
          }}
          aria-hidden="true"
        />
      </div>
    </>
  );
};

export default CreateFormPage;
