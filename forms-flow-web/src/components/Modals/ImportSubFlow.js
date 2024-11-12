import React, { useState, useEffect } from "react";
import ImportModal from "./ImportModal";
import FileService from "../../services/FileService";
import { createProcess } from "../../apiManager/services/processServices";
import { useSelector, useDispatch } from "react-redux";
import { push } from "connected-react-router";
import { MULTITENANCY_ENABLED } from "../../constants/constants";

const ImportSubflow = React.memo(({ showModal, closeImport, 
    processId, processVersion, setImportXml }) => {
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const dispatch = useDispatch();

  // Determine redirect URL based on multitenancy setting
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const [importError, setImportError] = useState("");
  const [importLoader, setImportLoader] = useState(false);
  const defaultPrimaryBtnText = "Create And Edit BPMN";
  const [primaryButtonText, setPrimaryButtonText] = useState(defaultPrimaryBtnText);

  const UploadActionType = {
    IMPORT: "import",
    VALIDATE: "validate"
  };

  // Update button text based on the import error state
  useEffect(() => {
    setPrimaryButtonText(importError ? "Try Again" : defaultPrimaryBtnText);
  }, [importError]);

  // Main import handler function
  const handleImport = async (fileContent, actionType) => {
    setImportLoader(true);

    if (!isValidActionType(actionType)) return setImportLoader(false);

    if (actionType === UploadActionType.VALIDATE && !isValidFileType(fileContent)) {
      setImportError("The file format is invalid. Please try again to import.");
      return setImportLoader(false);
    }

    if (actionType === UploadActionType.IMPORT) {
      await processImport(fileContent);
    }

    setImportLoader(false);
  };

  // Check if the action type is valid
  const isValidActionType = (actionType) => {
    if (!["validate", "import"].includes(actionType)) {
      console.error("Invalid UploadActionType provided");
      return false;
    }
    return true;
  };

  // Validate file type for .bpmn extension
  const isValidFileType = (file) => file && file.name.endsWith(".bpmn");

  // Handle importing process and dispatching upon success
  const processImport = async (fileContent) => {
    try {
      const extractedXml = await extractFileDetails(fileContent);

      if (processId) {
        // Update an existing process
        setImportXml(extractedXml);
        closeImport();
      } else {
        // Create a new process and redirect
        const response = await createProcess({ data: extractedXml, type: "bpmn" });
        if (response) {
          dispatch(push(`${redirectUrl}subflow/edit/${response.data.processKey}`));
        }
        closeImport();
      }
    } catch (error) {
      console.error("Error during import:", error);
      setImportError(error?.response?.data?.message || "An error occurred during import.");
    }
  };

  // Extract file details asynchronously
  const extractFileDetails = (fileContent) => {
    return new Promise((resolve, reject) => {
      FileService.extractFileDetails(fileContent, (result) => {
        result ? resolve(result) : reject("No valid XML found in the file.");
      });
    });
  };

  return (
    <ImportModal
      importModal={showModal}
      importLoader={importLoader}
      importError={importError}
      uploadActionType={UploadActionType}
      onClose={closeImport}
      handleImport={handleImport}
      fileType=".bpmn"
      headerText="Import New BPMN"
      primaryButtonText={primaryButtonText}
      processVersion={processVersion}
    />
  );
});

export default ImportSubflow;
