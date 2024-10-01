import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import ProgressBar from "react-bootstrap/ProgressBar";
import { Translation } from "react-i18next";
import { CloseIcon, CustomButton, UploadIcon, SuccessIcon, FailedIcon, IButton } from "@formsflow/components";

const ImportFormModal = React.memo(({ importFormModal, onClose, formSubmitted,
    uploadActionType, importError, importLoader, formName, description, handleImport }) => {
    const computedStyle = getComputedStyle(document.documentElement);
    const redColor = computedStyle.getPropertyValue("--ff-red-000");
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const onUpload = (evt) => {
        const file = evt.target.files[0];
        setSelectedFile(file);
    };

    const resetState = () => {
        setSelectedFile(null);
        setUploadProgress(0);
    };

    const onImport = () => {
        handleImport(selectedFile, uploadActionType.IMPORT);
    };

    useEffect(() => {
        if (selectedFile) {
            handleImport(selectedFile, uploadActionType.VALIDATE);
            let start = null;
            const duration = 2000;
            const animateProgress = (timestamp) => {
                if (!start) start = timestamp;
                const progress = Math.min(((timestamp - start) / duration) * 100, 100);
                setUploadProgress(progress);
                if (progress < 100) {
                    requestAnimationFrame(animateProgress);
                }
            };
            const animation = requestAnimationFrame(animateProgress);
            return () => cancelAnimationFrame(animation);
        }
    }, [selectedFile]);
    return (
        <Modal show={importFormModal} onHide={onClose} dialogClassName="modal-50w">
            <Modal.Header>
                <Modal.Title>
                    <b><Translation>{(t) => t("Import New Form")}</Translation></b>
                </Modal.Title>
                <div className="d-flex align-items-center">
                    <CloseIcon width="16.5" height="16.5"  onClick={() => {
                        resetState();
                        onClose();
                    }} />
                </div>
            </Modal.Header>
            <Modal.Body className="p-5">
                {selectedFile ? (
                    <>
                        <ProgressBar now={uploadProgress} />
                        <div className="upload-boady">
                            <div className="upload-details">
                                <p className="upload-file-name">{selectedFile.name}</p>
                                <span className={`${!importLoader && !importError ? 'upload-status-success' : !importLoader && importError ? 'upload-status-error' : 'upload-status-progress'}`}>
                                    {
                                        !importLoader && !importError ? (
                                            <Translation>{(t) => t("Upload Successful")}</Translation>
                                        ) : !importLoader && importError ? (
                                            <Translation>{(t) => t("Upload Failed")}</Translation>
                                        ) : (
                                            <Translation>{(t) => t("Import in progress")}</Translation>
                                        )
                                    }
                                </span>
                                {!importLoader && importError ? <FailedIcon color={redColor} />
                                    : !importLoader ? <SuccessIcon /> : null}
                            </div>
                            <div className={`${importError && formName ? 'upload-status-error' : "upload-form-details"}`}>{formName}</div>
                            {!importLoader && !importError && description && <div className="upload-form-details">{description}</div>}
                            <div>
                                {importError && <span className="upload-status-error">{importError}</span>}
                            </div>
                            {importError && importError.includes("already exists") &&
                                <div className="import-error-note">
                                    <div className="d-flex gap-2 align-items-center">
                                        <IButton />
                                        <Translation>{(t) => t("Note")}</Translation>
                                    </div>
                                    <div>
                                        <Translation>
                                            {(t) => t(`If you want to replace an existing form,
                                         open the form in the design menu that you want to 
                                         update, click "Actions", and then click "Import".`
                                            )}
                                        </Translation></div>
                                </div>}
                            <div>
                                {importError && !importError.includes("already exists") && <span className="upload-status-error"><Translation>{(t) => t("A system error occurred during import. Please try again to import.")}</Translation></span>}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="file-upload" onClick={() => document.getElementById('file-input').click()}>
                        <input
                            id="file-input"
                            type="file"
                            style={{ display: 'none' }}
                            onChange={onUpload}
                        />
                        <div className="upload-area">
                            <UploadIcon />
                            <p className="upload-text"><Translation>{(t) => t("Click or drag a file to this area to import")}</Translation></p>
                            <p className="upload-size-text"><Translation>{(t) => t("Support for a single file upload. Maximum file size 20MB.")}</Translation></p>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-start">
                <CustomButton
                    variant={importError && !selectedFile ? "dark" : "primary"}
                    disabled={importError}
                    size="md"
                    label={<Translation>{(t) => t("Confirm and Edit form")}</Translation>}
                    onClick={onImport}
                    buttonLoading={!importError && formSubmitted ? true : false}
                    className=""
                    dataTestid="confirm-and-edit-form"
                    ariaLabel="Confirm and Edit form"
                />
                <CustomButton
                    variant="secondary"
                    size="md"
                    label={<Translation>{(t) => t("Cancel")}</Translation>}
                    onClick={() => {
                        resetState();
                        onClose();
                    }}
                    className=""
                    dataTestid="cancel-import"
                    ariaLabel="Cancel Import"
                />
            </Modal.Footer>
        </Modal>
    );
});

export default ImportFormModal;
