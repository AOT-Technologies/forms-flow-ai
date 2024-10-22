

import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Translation } from "react-i18next";
import { CloseIcon, CustomButton } from "@formsflow/components";

const NewVersionModal = React.memo(({ show, title, createNewVersion, onClose,
    newVersion, isNewVersionLoading }) => {
    const [checkedAll, setCheckedAll] = useState(false);
    const [acceptState, setAcceptState] = useState({
        acceptFirst: false,
        acceptSecond: false,
        acceptThird: false
    });
    const clearState = () => {
        setAcceptState({
            acceptFirst: false,
            acceptSecond: false,
            acceptThird: false
        });
        onClose();
    };

    const handleAcceptFirst = (e) => {
        setAcceptState((prevState) => ({
            ...prevState,
            acceptFirst: e.target.checked,
        }));
    };

    const handleAcceptSecond = (e) => {
        setAcceptState((prevState) => ({
            ...prevState,
            acceptSecond: e.target.checked,
        }));
    };

    const handleAcceptThird = (e) => {
        setAcceptState((prevState) => ({
            ...prevState,
            acceptThird: e.target.checked,
        }));
    };

    useEffect(() => {
        acceptState.acceptFirst && acceptState.acceptSecond && acceptState.acceptThird ?
            setCheckedAll(true) : setCheckedAll(false);
    }, [acceptState]);

    return (
        <Modal show={show} onHide={clearState} dialogClassName="modal-50w">
            <Modal.Header>
                <Modal.Title>
                    <b>{title}</b>
                </Modal.Title>
                <div className="d-flex align-items-center">
                    <CloseIcon width="16.5" height="16.5" onClick={() => {
                        clearState();
                    }} />
                </div>
            </Modal.Header>
            <Modal.Body className="newversion-modal-body">
                <div className="d-flex justify-content-between align-items-center">
                    <label className="form-check-label" htmlFor="acceptFirst">
                        Will be saved as a Version {newVersion}
                    </label>
                    <div className="d-flex align-items-center">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="acceptFirst"
                            checked={acceptState.acceptFirst}
                            onChange={handleAcceptFirst}
                        />
                        <label className="form-check-label ms-2" htmlFor="acceptFirst">I understand</label>
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                    <label className="form-check-label" htmlFor="acceptSecond">
                        You will not be able to affect previous submissions after
                    </label>
                    <div className="d-flex align-items-center">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="acceptSecond"
                            checked={acceptState.acceptSecond}
                            onChange={handleAcceptSecond}
                        />
                        <label className="form-check-label ms-2" htmlFor="acceptSecond">I understand</label>
                    </div>
                </div>


                <div className="d-flex justify-content-between align-items-center">
                    <label className="form-check-label" htmlFor="acceptThird">
                        This action cannot be undone
                    </label>
                    <div className="d-flex align-items-center">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="acceptThird"
                            checked={acceptState.acceptThird}
                            onChange={handleAcceptThird}
                        />
                        <label className="form-check-label ms-2" htmlFor="acceptThird">I understand</label>
                    </div>
                </div>

            </Modal.Body>

            <Modal.Footer className="d-flex justify-content-start">
                <CustomButton
                    variant={!checkedAll ? "dark" : "primary"}
                    disabled={!checkedAll}
                    size="md"
                    label={<Translation>{(t) => t(`Save as Version ${newVersion}`)}</Translation>}
                    onClick={() => createNewVersion()}
                    buttonLoading={isNewVersionLoading ? true : false}
                    dataTestid="confirm-new-version"
                    ariaLabel="Confirm New Version"
                />
                <CustomButton
                    variant="secondary"
                    size="md"
                    label={<Translation>{(t) => t("Cancel")}</Translation>}
                    onClick={() => {
                        clearState();
                    }}
                    className=""
                    dataTestid="cancel-import"
                    ariaLabel="Cancel Import"
                />
            </Modal.Footer>
        </Modal>
    );
});

export default NewVersionModal;
