import React from "react";
import Modal from "react-bootstrap/Modal";
import { useTranslation } from "react-i18next";

const MessageModal = React.memo((props) => {
    const { t } = useTranslation();
    const {
        modalTitle = null,
        modalOpen = false,
        message,
        onNo,
    } = props;

    return (
        <>
            <Modal data-testid="Warning-modal" show={modalOpen}>
                <Modal.Header>
                    <div>
                        <Modal.Title id="example-custom-modal-styling-title warning">
                            {modalTitle}
                        </Modal.Title>
                    </div>
                </Modal.Header>
                <Modal.Body>{message}</Modal.Body>
                <Modal.Footer>
                    <button
                        type="button"
                        className="btn btn-primary"
                        data-testid="ok-button"
                        onClick={onNo}>
                        {t("Ok")}
                    </button>

                </Modal.Footer>
            </Modal>
        </>
    );
});

export default MessageModal;
