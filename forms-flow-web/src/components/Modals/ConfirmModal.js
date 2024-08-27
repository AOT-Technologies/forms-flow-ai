import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "../../components/CustomComponents/Button";
import { Translation } from "react-i18next";

const ConfirmModal = React.memo(({
    show,
    onCancel,
    title,
    message,
    messageSecondary,
    onConfirm,
    confirmText,
    cancelText,
    cancelBtndataTestid,
    confirmBtndataTestid,
    confirmBtnariaLabel,
    cancelBtnariaLabel
}) => {

    return (
        <>
            {!missingProps && <Modal
                show={show}
                onHide={onCancel}
                dialogClassName="modal-50w"
                data-testid="confirm-modal"
                aria-labelledby="confirm-modal-title"
                aria-describedby="confirm-modal-message"
            >
                <Modal.Header>
                    <Modal.Title id="confirm-modal-title">
                        <b>
                            <Translation>{(t) => t(title)}</Translation>
                        </b>
                    </Modal.Title>
                    <div className="d-flex align-items-center">
                        <button
                            type="button"
                            className="close-modal"
                            onClick={onCancel}
                            aria-label="Close confirmation modal"
                            data-testid="close-confirm-modal"
                        >
                            X
                        </button>
                    </div>
                </Modal.Header>
                <Modal.Body className="p-5">
                    <div
                        className="d-flex flex-column"
                        id="confirm-modal-message"
                    >
                        <div
                            className="message-primary"
                            data-testid="confirm-modal-primary-message"
                            aria-label="Primary message"
                        >
                            <Translation>{(t) => t(message)}</Translation>
                        </div>
                        {messageSecondary && (
                            <div
                                className="message-secondary"
                                data-testid="confirm-modal-secondary-message"
                                aria-label="Secondary message"
                            >
                                <Translation>{(t) => t(messageSecondary)}</Translation>
                            </div>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-start">
                    <Button
                        variant={"primary"}
                        size="md"
                        label={<Translation>{(t) => t(confirmText)}</Translation>}
                        onClick={onConfirm}
                        dataTestid={confirmBtndataTestid}
                        ariaLabel={confirmBtnariaLabel}
                    />
                    <Button
                        variant="secondary"
                        size="md"
                        label={<Translation>{(t) => t(cancelText)}</Translation>}
                        onClick={onCancel}
                        dataTestid={cancelBtndataTestid}
                        ariaLabel={cancelBtnariaLabel}
                    />
                </Modal.Footer>
            </Modal>}
        </>
    );
});

ConfirmModal.defaultProps = {
    messageSecondary: '',
    confirmBtndataTestid: 'Confirm-button',
    confirmBtnariaLabel: 'Confirm Button',
    cancelBtndataTestid: 'cancel-button',
    cancelBtnariaLabel: 'Cancel Button'
};

export default ConfirmModal;
