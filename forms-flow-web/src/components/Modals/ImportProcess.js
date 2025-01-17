import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ImportModal } from "@formsflow/components";
import FileService from "../../services/FileService";
import { createProcess,updateProcess } from "../../apiManager/services/processServices";
import { useSelector, useDispatch } from "react-redux";
import { push } from "connected-react-router";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { useTranslation} from "react-i18next";
import {setProcessData} from "../../actions/processActions";

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
  const { t } = useTranslation();

  // Determine redirect URL and text based on file type
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const baseUrl = fileType === ".bpmn" ? "subflow/edit/" : "decision-table/edit/";
  const defaultPrimaryBtnText = fileType === ".bpmn" ? t("Create And Edit BPMN") : t("Create And Edit DMN");
  const [importError, setImportError] = useState("");
  const [importLoader, setImportLoader] = useState(false);
  const [primaryButtonText, setPrimaryButtonText] = useState(defaultPrimaryBtnText);

  const getHeaderText = () => {
    if (processId) {
      return "Import File";
    }
    return `${t("Import New")} ${fileType === ".bpmn" ? "BPMN" : "DMN"}`;
  };

  const headerText = getHeaderText();
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
  const isValidFileType = (file) => file?.name?.endsWith(fileType);

  // Handle importing process and dispatching upon success
  const processImport = async (fileContent) => {
    try {
      const {xml} = await extractFileDetails(fileContent);
      if(!xml) return;
      if (processId) {
        // Update an existing process
        const response = await updateProcess({
          id: processId,
          data:xml,
          type: fileType === ".bpmn" ? "bpmn" : "dmn"
        });
        dispatch(setProcessData(response?.data));
        setImportXml(xml);
        closeImport();
      } else {
        // Create a new process and redirect
        const response = await createProcess({ data: xml, type: fileType === ".bpmn" ? "bpmn" : "dmn" });
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
  const extractFileDetails = async (fileContent) => {
    const extractedXml = await FileService.extractFileDetails(fileContent);
    return extractedXml;
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
