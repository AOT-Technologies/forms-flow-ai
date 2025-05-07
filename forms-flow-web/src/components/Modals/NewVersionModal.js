

import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { useTranslation } from "react-i18next";
import { CloseIcon, CustomButton } from "@formsflow/components";

const NewVersionModal = React.memo(({ show, title, createNewVersion, onClose,
    newVersion, isNewVersionLoading }) => {
    const { t } = useTranslation();
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
        <Modal show={show} onHide={clearState} dialogClassName="modal-50w" size="sm" centered={true}>
            <Modal.Header>
                <Modal.Title>
                    <p>{title}</p>
                </Modal.Title>
                <div className="icon-close" onClick={() => {
                        clearState();
                    }} >
                    <CloseIcon />
                </div>
            </Modal.Header>
            <Modal.Body className="newversion-modal-body">
                <div className="d-flex justify-content-between align-items-center">
                    <label className="form-check-label" htmlFor="acceptVersion">
                        Will be saved as a Version {newVersion}
                    </label>
                    <span className="dashed-line"></span>
                    <div className="d-flex align-items-center">
                        <input
                            className="form-check-input mt-0"
                            type="checkbox"
                            id="acceptVersion"
                            checked={acceptState.acceptVersion}
                            onChange={handleAcceptFirst}
                            data-testid="checkbox-save-as-version"
                        />
                        <label className="form-check-label ms-2" htmlFor="acceptVersion">I understand</label>
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                    <label className="form-check-label" htmlFor="affectSubmissions">
                        You will not be able to affect previous submissions after
                    </label>
                    <span className="dashed-line"></span>
                    <div className="d-flex align-items-center">
                        <input
                            className="form-check-input mt-0"
                            type="checkbox"
                            id="affectSubmissions"
                            checked={acceptState.affectSubmissions}
                            onChange={handleAcceptSecond}
                            data-testid="checkbox-will-not-affect-previous-submissions"
                        />
                        <label className="form-check-label ms-2" htmlFor="affectSubmissions">I understand</label>
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                    <label className="form-check-label" htmlFor="cannotUndo">
                        This action cannot be undone
                    </label>
                    <span className="dashed-line"></span>
                    <div className="d-flex align-items-center">
                        <input
                            className="form-check-input mt-0"
                            type="checkbox"
                            id="cannotUndo"
                            checked={acceptState.cannotUndo}
                            onChange={handleAcceptThird}
                            data-testid="checkbox-action-cannot-undo"
                        />
                        <label className="form-check-label ms-2" htmlFor="cannotUndo">I understand</label>
                    </div>
                </div>


            </Modal.Body>

            <Modal.Footer className="d-flex justify-content-start">
                <CustomButton
                    variant={!checkedAll ? "dark" : "primary"}
                    disabled={!checkedAll}
                    size="md"
                    label={t(`Save as Version ${newVersion}`)}
                    onClick={() => createNewVersion()}
                    buttonLoading={isNewVersionLoading ? true : false}
                    dataTestId="confirm-new-version"
                    ariaLabel="Confirm New Version"
                />
                <CustomButton
                    variant="secondary"
                    size="md"
                    label={t("Cancel")}
                    onClick={() => {
                        clearState();
                    }}
                    className=""
                    dataTestId="cancel-import"
                    ariaLabel="Cancel Import"
                />
            </Modal.Footer>
        </Modal>
    );
});

export default NewVersionModal;
