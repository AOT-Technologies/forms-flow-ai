import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  EditPencilIcon,
  //AiIcon,
  BreadCrumbs,
  FileUploadArea,
  useProgressBar,
} from "@formsflow/components";
import {
  navigateToDesignFormEdit,
  navigateToDesignFormsListing,
  navigateToDesignFormCreate,
} from "../../../helper/routerHelper";
import { getRoute } from "../../../constants/constants";
import { formImport } from "../../../apiManager/services/FormServices";
import { MAX_FILE_SIZE } from "../../../constants/constants";

// Constants
const UPLOAD_PROGRESS_INCREMENT = 5;
const UPLOAD_PROGRESS_INTERVAL = 300;
const INITIAL_UPLOAD_PROGRESS = 10;
const COMPLETE_PROGRESS = 100;

const UploadActionType = {
  IMPORT: "import",
  VALIDATE: "validate",
};

const CreateFormPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const tenantKey = useSelector((state) => state.tenants?.tenantId);

  // State management
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [isValidationSuccessful, setIsValidationSuccessful] = useState(false);
  const [validatedFile, setValidatedFile] = useState(null);

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

  /**
   * Resets the upload state to allow user to retry with a new file
   */
  const resetUploadState = useCallback(() => {
    setIsUploading(false);
    reset();
    setUploadError("");
    setSelectedFile(null);
    setIsValidationSuccessful(false);
    setValidatedFile(null);
  }, [reset]);

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

  // Helper function to validate the action type
  const isValidUploadActionType = useCallback((actionType) => {
    if (!["validate", "import"].includes(actionType)) {
      console.error("Invalid UploadActionType provided");
      setIsUploading(false);
      return false;
    }
    return true;
  }, []);

  // Helper function to prepare data for the API request
  const prepareImportData = useCallback((actionType) => {
    const data = {
      importType: "new",
      action: actionType,
    };

    // Set uploading state for both validate and import actions
    if (actionType === "validate" || actionType === "import") {
      setIsUploading(true);
    }

    return data;
  }, []);

  // Helper function to handle the API response
  const handleImportResponse = useCallback(async (res, file, action) => {
    setIsUploading(false);
    const { data: responseData } = res;

    if (!responseData) return;

    /* -------------------------- if action is validate ------------------------- */
    if (action === "validate") {
      // Validation successful - store file and mark validation as successful
      setValidatedFile(file);
      setIsValidationSuccessful(true);
      // Complete progress to show validation success
      complete();
      return;
    } else {
      /* ------------------------- if action is import ------------------------- */
      const formId = responseData.mapper?.formId;

      if (!formId) {
        throw new Error("Form ID not received from server");
      }

      // Complete upload progress
      complete();
      
      // Wait for progress bar to show 100% before navigating (allows UI to update)
      setTimeout(() => {
        navigateToDesignFormEdit(dispatch, tenantKey, formId);
      }, 600);
    }
  }, [complete, dispatch, tenantKey]);

  // Helper function to handle errors
  const handleImportError = useCallback((err) => {
    setIsUploading(false);
    setIsValidationSuccessful(false);
    setValidatedFile(null);
    const errorMessage = err?.response?.data?.message || 
                        err?.message || 
                        t("Failed to import form");
    setUploadError(errorMessage);

    // Complete progress after error so UI doesn't flash Done/Cancel
    complete();

    // Wait for progress bar to show 100% before finalizing state
    setTimeout(() => {
      setIsUploading(false);
    }, 500);
  }, [complete, t]);

  /**
   * Handles file upload and form import
   * @param {File} file - The file to upload
   * @param {string} uploadActionType - The action type (import or validate)
   */
  const handleFileUpload = useCallback(async (file, 
    uploadActionType = UploadActionType.VALIDATE) => {
    if (!file) {
      return;
    }

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    if (!isValidUploadActionType(uploadActionType)) return;

    // Initialize upload state
    setSelectedFile(file);
    setUploadError("");
    reset();

    const data = prepareImportData(uploadActionType);

    try {
      const res = await formImport(file, JSON.stringify(data));
      await handleImportResponse(res, file, data.action);
    } catch (err) {
      handleImportError(err);
    }
  }, [validateFile, isValidUploadActionType, prepareImportData, 
    handleImportResponse, handleImportError, reset]);

  /**
   * Handles the Done button click after validation succeeds
   * This will trigger the import action
   */
  const handleDoneClick = useCallback(() => {
    if (isValidationSuccessful && validatedFile) {
      // Reset validation state before starting import
      setIsValidationSuccessful(false);
      handleFileUpload(validatedFile, UploadActionType.IMPORT);
    }
  }, [isValidationSuccessful, validatedFile, handleFileUpload]);

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
  const handleBreadcrumbClick = useCallback((item) => {
    if (item?.id === "forms") {
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
    { id: "forms", label: t("Forms"), href: getRoute(tenantKey).FORMFLOW },
    { id: "create-new-form", label: t("Create New Form") },
    { id: "edit", label: t("Edit") },
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
              onDone={isValidationSuccessful ? handleDoneClick : resetUploadState}
              file={selectedFile}
              progress={(() => {
                if (isUploading) return uploadProgress;
                if (isValidationSuccessful && selectedFile) return COMPLETE_PROGRESS;
                if (uploadError && selectedFile) return COMPLETE_PROGRESS;
                return 0;
              })()}
              error={uploadError}
              ariaLabel={t("Upload .json file area")}
              dataTestId="form-upload-area"
              className="grid-item"
              maxFileSizeMB={MAX_FILE_SIZE / (1024 * 1024)}
              primaryButtonText={t("Done")}
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
          tabIndex={-1}
        />
      </div>
    </>
  );
};

export default CreateFormPage;
