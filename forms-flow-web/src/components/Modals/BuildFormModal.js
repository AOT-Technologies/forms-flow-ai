import React, { useRef, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { CloseIcon, CustomButton } from "@formsflow/components";


import { Translation } from "react-i18next";

const BuildFormModal = React.memo(({ showBuildForm, onClose, handleChange, handleBuild,
    setFormDescription, setNameError, nameError, formSubmitted }) => {
    // const [name, setName] = useState("");
    const textareaRef = useRef(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            const handleInput = () => {
                textarea.style.height = 'auto';
                textarea.style.height = `${textarea.scrollHeight}px`;
            };
            textarea.addEventListener('input', handleInput);
            return () => {
                textarea.removeEventListener('input', handleInput);
            };
        }
    }, [showBuildForm]);

    return (
        <>
            <Modal show={showBuildForm} onHide={onClose} dialogClassName="modal-50w">
                <Modal.Header>
                    <Modal.Title>
                        <b>
                            <Translation>{(t) => t("Build New Form")}</Translation>
                        </b>
                    </Modal.Title>
                    <div className="d-flex align-items-center">
                        <CloseIcon width="16.5" height="16.5"  onClick={onClose} />
                    </div>
                </Modal.Header>
                <Modal.Body className="build-modal-body">
                    <label className="form-label">Name</label>
                    <span className="valiation-astrisk">*</span>
                    <input
                        type="text"
                        className={`form-input h-40 ${nameError ? "input-error" : "mb-4"}`}
                        aria-label="Name of the form"
                        onChange={(event) => {
                            // setName(event.target.value);
                            setNameError("");
                            handleChange("title", event);
                        }}
                        required
                    />
                    {nameError && <div className="validation-text mb-4">{nameError}</div>}

                    <label className="form-label">Description</label>
                    <textarea
                        onChange={(e) => setFormDescription(e.target.value)}
                        // value={formDescription}
                        ref={textareaRef}
                        className="form-input h-40"
                        aria-label="Description of the new form"
                        rows="1"
                    ></textarea>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-start">
                    <CustomButton
                        variant={nameError ? "dark" : "primary"}
                        size="md"
                        disabled={nameError || formSubmitted}
                        label={<Translation>{(t) => t("Create and Edit form")}</Translation>}
                        buttonLoading={!nameError && formSubmitted ? true : false}
                        onClick={handleBuild}
                        className=""
                        dataTestid={`build-form-button`}
                        ariaLabel="Build Form Button"
                    />

                    <CustomButton
                        variant="secondary"
                        size="md"
                        label={<Translation>{(t) => t("Close")}</Translation>}
                        onClick={onClose}
                        className=""
                        dataTestid={"build-modal-colse"}
                        ariaLabel="Close build modal Button"
                    />
                </Modal.Footer>
            </Modal>
        </>
    );
});

export default BuildFormModal;
