import React, { useState, useEffect } from "react";
import { ImportModal } from "@formsflow/components";
import FileService from "../../services/FileService";
import { createProcess } from "../../apiManager/services/processServices";
import { useSelector, useDispatch } from "react-redux";
import { push } from "connected-react-router";
import { MULTITENANCY_ENABLED } from "../../constants/constants";

const ImportDecisionTable = React.memo(({ showModal, closeImport,
    processId, processVersion, setImportXml }) => {
    const tenantKey = useSelector((state) => state.tenants?.tenantId);
    const dispatch = useDispatch();

    // Determine redirect URL based on multitenancy setting
    const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
    const [importError, setImportError] = useState("");
    const [importLoader, setImportLoader] = useState(false);
    const defaultPrimaryBtnText = "Create And Edit DMN";
    const [primaryButtonText, setPrimaryButtonText] = useState(defaultPrimaryBtnText);

    const UploadActionType = {
        IMPORT: "import",
        VALIDATE: "validate"
    };

    // Update button text if there's an error
    useEffect(() => {
        setPrimaryButtonText(importError ? "Try Again" : defaultPrimaryBtnText);
    }, [importError]);

    // Handle importing and validation actions
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
    const isValidActionType = (actionType) => ["validate", "import"].includes(actionType);

    // Validate file type for .dmn extension
    const isValidFileType = (file) => file && file.name.endsWith(".dmn");

    // Handle importing process and dispatching upon success
    const processImport = async (fileContent) => {
        try {
            const extractedXml = await extractFileDetails(fileContent);

            if (processId) {
                // If updating an existing process, close modal and set XML
                setImportXml(extractedXml);
                closeImport();
            } else {
                // Otherwise, create a new process and redirect
                const response = await createProcess({ data: extractedXml, type: "dmn" });
                if (response) {
                    dispatch(push(`${redirectUrl}decision-table/edit/${response.data.processKey}`));
                }
                closeImport();
            }
        } catch (error) {
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
            headerText={processId ? "Import File" : "Import New DMN"}
            primaryButtonText={primaryButtonText}
            fileType=".dmn"
            processVersion={processVersion}
        />
    );
});

export default ImportDecisionTable;
