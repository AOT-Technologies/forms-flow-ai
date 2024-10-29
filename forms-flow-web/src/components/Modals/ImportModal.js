import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import ProgressBar from "react-bootstrap/ProgressBar";
import Dropdown from 'react-bootstrap/Dropdown';
import { Translation } from "react-i18next";
import { CloseIcon, CustomButton, UploadIcon, SuccessIcon, FailedIcon, IButton, DropdownIcon } from "@formsflow/components";

const ImportModal = React.memo(({ importFormModal, onClose, formSubmitted,
    uploadActionType, importError, importLoader, formName, description,
    handleImport, fileItems,  headerText, primaryButtonText}) => {

    const computedStyle = getComputedStyle(document.documentElement);
    const redColor = computedStyle.getPropertyValue("--ff-red-000");
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedLayoutVersion, setSelectedLayoutOption] = useState(null);
    const [selectedFlowVersion, setSelectedFlowOption] = useState(null);

    const layoutOptions = [
        { value: true, label: 'Skip, do not import' },
        { value: 'major', label: `import as version ${fileItems?.form?.majorVersion} (only impacts new submissions)` },
        { value: 'minor', label: `import as version ${fileItems?.form?.minorVersion} (impacts previous and new submissions)` }
    ];

    const flowOptions = [
        { value: true, label: 'Skip, do not import' },
        { value: 'major', label: `import as version ${fileItems?.workflow?.majorVersion ?? 1}.${fileItems?.workflow?.minorVersion ?? 0} (only impacts new submissions)` }
    ];

    const handleLayoutChange = (option) => {
        setSelectedLayoutOption(option);
        console.log("Selected Layout:", option.value);
    };
    const handFlowChange = (option) => {
        setSelectedFlowOption(option);
        console.log("Selected Layout:", option.value);
    };

    const onUpload = (evt) => {
        const file = evt.target.files[0];
        setSelectedFile(file);
    };

    const resetState = () => {
        setSelectedFile(null);
        setUploadProgress(0);
    };

    const closeModal = () => {
        setSelectedFile(null);
        setUploadProgress(0);
        setSelectedLayoutOption(null);
        setSelectedFlowOption(null);
        onClose();
    };

    const onImport = () => {
        closeModal();
        handleImport(selectedFile, uploadActionType.IMPORT,
            selectedLayoutVersion?.value, selectedFlowVersion?.value);
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
        <Modal show={importFormModal} onHide={closeModal} centered={true} size="sm">
            <Modal.Header>
                <Modal.Title>
                    <b><Translation>{(t) => t(headerText)}</Translation></b>
                </Modal.Title>
                <div className="d-flex align-items-center">
                    <CloseIcon width="16.5" height="16.5" onClick={() => {
                        resetState();
                        closeModal();
                    }} />
                </div>
            </Modal.Header>
            <Modal.Body className="p-5">
                {selectedFile ? (<>
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
                        {!importError && description && <div className="upload-form-details">{description}</div>}
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
                            {importError && !importError.includes("already exists")
                                && <span className="upload-status-error"><Translation>{(t) =>
                                    t("A system error occurred during import. Please try again to import.")}</Translation></span>}
                        </div>
                    </div>
                    {!importError && Object.values(fileItems).some(item =>
                        item?.majorVersion != null || item?.minorVersion != null) && (
                            <div className="import-container">
                                {/* First Row */}
                                    <div className="import-error-note d-block">

                                        <div className="mx-2 d-flex align-items-center">
                                            <IButton />
                                            <span className="ms-2">
                                                <Translation>
                                                    {(t) => t("Import will create a new version.")}
                                                </Translation>
                                            </span>
                                        </div>
                                    </div>
                                <div className="import-details">
                                    <div className="file-item-header-text">Type</div>
                                    <div className="file-item-header-text">Import</div>
                                </div>

                                {/* Second Row */}
                                {fileItems?.form?.majorVersion && <div className="file-item-content">
                                    <div className="import-layout-text">Layout</div>
                                    <div className="flex-grow-1">
                                        <Dropdown className="dropdown-main">
                                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                                                <div className="d-flex justify-content-between align-items-center w-100">
                                                    <div className="text-truncate">
                                                        {selectedLayoutVersion ? selectedLayoutVersion.label : 'Skip, do not import'}
                                                    </div>
                                                    <DropdownIcon />
                                                </div>

                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                                {layoutOptions.map((option, index) => (
                                                    <Dropdown.Item
                                                        placeHolder="Skip, Donot Import"
                                                        key={index}
                                                        onClick={() => 
                                                        handleLayoutChange(option)
                                                        }                                    >
                                                        {option.label}

                                                    </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>}

                                {/* Third Row */}
                                {fileItems?.workflow?.majorVersion && <div className="file-item-content">
                                    <div className="import-workflow-text">Flow</div>
                                    <div className="flex-grow-1">
                                        <Dropdown className="dropdown-main">
                                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                                                <div className="d-flex justify-content-between align-items-center w-100">
                                                    <div className="text-truncate">
                                                        {selectedFlowVersion ? selectedFlowVersion.label : 'Skip, do not import'}
                                                    </div>
                                                    <DropdownIcon />
                                                </div>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                {flowOptions.map((option, index) => (
                                                    <Dropdown.Item
                                                        key={index}
                                                        onClick={() => handFlowChange(option)}
                                                        className="text-truncate"
                                                    >
                                                        {option.label}
                                                    </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>

                                </div>}
                            </div>
                        )}

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
            <Modal.Footer>
                <CustomButton
                    variant={importError && !selectedFile ? "dark" : "primary"}
                    disabled={importError}
                    size="md"
                    label={<Translation>{(t) => t(primaryButtonText)}</Translation>}
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
                        closeModal();
                    }}
                    className=""
                    dataTestid="cancel-import"
                    ariaLabel="Cancel Import"
                />
            </Modal.Footer>
        </Modal>
    );
});

export default ImportModal;
