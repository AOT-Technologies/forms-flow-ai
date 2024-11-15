import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ImportModal } from "@formsflow/components";
import FileService from "../../services/FileService";
import { createProcess } from "../../apiManager/services/processServices";
import { useSelector, useDispatch } from "react-redux";
import { push } from "connected-react-router";
import { MULTITENANCY_ENABLED } from "../../constants/constants";

const ImportProcess = React.memo(({
  showModal,
  closeImport,
  processId,
  processVersion,
  setImportXml,
  fileType
}) => {
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const dispatch = useDispatch();

  // Determine redirect URL and text based on file type
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const baseUrl = fileType === ".bpmn" ? "subflow/edit/" : "decision-table/edit/";
  const defaultPrimaryBtnText = fileType === ".bpmn" ? "Create And Edit BPMN" : "Create And Edit DMN";
  const headerText = processId ? "Import File" : `Import New ${fileType === ".bpmn" ? "BPMN" : "DMN"}`;
  const [importError, setImportError] = useState("");
  const [importLoader, setImportLoader] = useState(false);
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
      setImportError(`The file format is invalid. Please import a ${fileType} file.`);
      return setImportLoader(false);
    }

    if (actionType === UploadActionType.IMPORT) {
      await processImport(fileContent);
    }

    setImportLoader(false);
  };

  // Check if the action type is valid
  const isValidActionType = (actionType) => ["validate", "import"].includes(actionType);

  // Validate file type
  const isValidFileType = (file) => file && file.name.endsWith(fileType);

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
        const response = await createProcess({ data: extractedXml, type: fileType === ".bpmn" ? "bpmn" : "dmn" });
        if (response) {
          dispatch(push(`${redirectUrl}${baseUrl}${response.data.processKey}`));
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
      showModal={showModal}
      importLoader={importLoader}
      importError={importError}
      uploadActionType={UploadActionType}
      onClose={closeImport}
      handleImport={handleImport}
      fileType={fileType}
      headerText={headerText}
      primaryButtonText={primaryButtonText}
      processVersion={processVersion}
    />
  );
});

ImportProcess.propTypes = {
  showModal: PropTypes.bool.isRequired,
  closeImport: PropTypes.func.isRequired,
  processId: PropTypes.string,
  processVersion: PropTypes.string,
  setImportXml: PropTypes.func.isRequired,
  fileType: PropTypes.oneOf([".bpmn", ".dmn"]).isRequired
};

export default ImportProcess;
