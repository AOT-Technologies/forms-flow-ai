import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useSelector } from "react-redux";
import Spinner from "react-bootstrap/Spinner";
import { Translation, useTranslation } from "react-i18next";

// eslint-disable-next-line no-unused-vars
const FileModal = React.memo(({ modalOpen = false, onClose, forms }) => {
  const formUploadList = useSelector(
    (state) => state.formCheckList.formUploadFormList
  );
  const formUploadCounter = useSelector(
    (state) => state.formCheckList.formUploadCounter
  );
  const [formsUploaded, setFormsUploaded] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    if (formUploadList.length) {
      setFormsUploaded((formUploadCounter / formUploadList.length) * 100);
    }
  }, [formUploadCounter, formUploadList]);
  return (
    <>
      <Modal show={modalOpen} onHide={onClose}>
        <Modal.Header>
          <Modal.Title>
            <b>
              <Translation>{(t) => t("File Upload Status")}</Translation>
            </b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            {`${formUploadCounter}/${formUploadList.length} ${
              formUploadList.length > 1
                ? t("Forms Completed")
                : t("Form Completed")
            }
            `}
            {formUploadList.length !== formUploadCounter ? (
              <Spinner animation="border" variant="primary" />
            ) : (
              ""
            )}
          </div>
          {formUploadList.length ? (
            <div className="progress">
              <div
                className="progress-bar"
                role="progressbar"
                aria-valuenow={formsUploaded}
                aria-label="upload-status"
                aria-valuemax={`${formsUploaded}`}
                style={{ width: `${formsUploaded ? "100%" : "0%"}` }}
              ></div>
            </div>
          ) : (
            <div>
              <Translation>{(t) => t("No forms found")}</Translation>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" className="btn btn-default" onClick={onClose}>
            <Translation>{(t) => t("Close")}</Translation>
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
});

export default FileModal;
