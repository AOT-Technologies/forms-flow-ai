import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useTranslation } from 'react-i18next';

const Confirm = React.memo((props)=>{
    const {t} = useTranslation();
    const { modalOpen=false, onYes, onNo, message, yesText = t("Yes"), noText = t("No")} = props;
    return (
      <>
          <Modal show={modalOpen}>
              <Modal.Header>
                 <Modal.Title>{t("del_confirmation")}</Modal.Title>
              </Modal.Header>
              <Modal.Body>{message}</Modal.Body>
              <Modal.Footer>
              <Button type="button" className="btn btn-default" onClick={onYes}>{yesText}</Button>
              <Button type="button" className="btn btn-danger mr-3" onClick={onNo}>{noText}</Button>
              </Modal.Footer>
          </Modal>
        </>
    )
})

export default Confirm;
