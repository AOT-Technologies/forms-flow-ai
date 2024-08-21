import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import ProgressBar from "./ProgressBar";
import { Translation } from "react-i18next";
import Button from "../CustomComponents/Button";

const ImportFormModal = React.memo(({ importFormModal, onClose, uploadAction }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setUploadProgress(40);
    };

    // const handleUpload = async () => {
    //     if (selectedFile) {
    //         const formData = new FormData();
    //         formData.append("file", selectedFile);

    //         try {
    //             const response = await fetch("/upload-endpoint", {
    //                 method: "POST",
    //                 body: formData,
    //                 onUploadProgress: (progressEvent) => {
    //                     const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    //                     setUploadProgress(progress);
    //                 },
    //             });

    //             if (response.ok) {
    //                 // Handle success
    //                 console.log("File uploaded successfully");
    //                 setUploadProgress(100);
    //             } else {
    //                 // Handle error
    //                 console.error("File upload failed");
    //             }
    //         } catch (error) {
    //             console.error("Error uploading file:", error);
    //         }
    //     }
    // };

    useEffect(() => {
        console.log(selectedFile);
    }, [selectedFile]);

    return (
        <>
            <Modal show={importFormModal} onHide={onClose} dialogClassName="modal-50w">
                <Modal.Header>
                    <Modal.Title>
                        <b>
                            <Translation>{(t) => t("Import New Form")}</Translation>
                        </b>
                    </Modal.Title>
                    <div className="d-flex align-items-center">
                        <button
                            type="button"
                            className="btn-close close-modal"
                            onClick={() => {
                                setSelectedFile(null);
                                onClose();
                            }}
                            aria-label="Close"
                            data-testid="form-history-modal-close-button"
                        ></button>
                    </div>
                </Modal.Header>
                <Modal.Body className="p-5">
                    {selectedFile &&
                        (
                            <>
                                <ProgressBar formsUploaded={uploadProgress} />
                                <div className="upload-details">
                                    <p className="upload-file-name">{selectedFile.name}</p>
                                    <span className="success-tic-svg"></span>
                                    <span className={`${uploadProgress >= 100 ? 'upload-status-success' : 'upload-status-progress'}`}>{`${uploadProgress >= 100 ? "Upload Successful" : "Import in progress"}`}</span>
                                </div>
                            </>
                        )}

                    {!selectedFile && <div className="file-upload" onClick={() => document.getElementById('file-input').click()}>
                        <input
                            id="file-input"
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <div className="upload-area">
                            <div className="upload-svg"></div>
                            <p className="upload-text">Click or drag a file to this area to import</p>
                            <p className="uplad-size-text">Support for a single file upload. Maximum file size 20MB.</p>
                        </div>
                    </div>}
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-start">
                    <Button
                        variant={!selectedFile ? "dark" : "primary"}
                        disabled={!selectedFile ? true : false}
                        size="md"
                        label={<Translation>{(t) => t("Confirm and Edit form")}</Translation>}
                        onClick={uploadAction}
                        className=""
                        dataTestid={`confirm-and-edit-form`}
                        ariaLabel="Confirm and Edit form"
                    />
                    <Button
                        variant="secondary"
                        size="md"
                        label={<Translation>{(t) => t("Cancel")}</Translation>}
                        onClick={() => {
                            setSelectedFile(null);
                            onClose();
                        }}
                        className=""
                        dataTestid={"cancel-import"}
                        ariaLabel="Cancel Import"
                    />
            </Modal.Footer>
        </Modal >
        </>
    );
});

export default ImportFormModal;
