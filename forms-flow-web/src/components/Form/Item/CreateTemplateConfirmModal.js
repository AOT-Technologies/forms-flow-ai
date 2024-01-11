import React from 'react';
import { Modal } from 'react-bootstrap';
import {useTranslation} from "react-i18next";


const CreateTemplateConfirmModal = ({modalOpen,handleModalChange,onConfirm}) => {
  const { t } = useTranslation();
  return (
   <>
     <Modal
          show={modalOpen}
          size="md"
          aria-labelledby="example-custom-modal-styling-title"
        >
          <Modal.Header>
            <div>
              <Modal.Title id="example-custom-modal-styling-title">
                {t("Create a duplicate form")}
              </Modal.Title>
            </div>

            <div>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  handleModalChange();
                }}
                aria-label="Close"
                data-testid="form-duplicate-modal-close-button"
              >
              </button>
            </div>
          </Modal.Header>

          <Modal.Body>
            <div className="d-flex align-items-start p-3">
              <i className="fa fa-info-circle text-primary me-2"></i>
              <span > 
              {t("Do you want to create a duplicate form and associated workflow from existing form ?")} 
              </span>
            </div>
    
          </Modal.Body>
          <Modal.Footer>
            <div className='d-flex justify-content-end'>
                <button data-testid="form-duplicate-no-button" className='btn btn-danger me-2' onClick={()=>{handleModalChange();}}>{t("No")}</button>
                <button data-testid="form-duplicate-yes-button" className='btn btn-primary' onClick={()=>{onConfirm();}}>{t("Yes")}</button>
            </div>
          </Modal.Footer>
        </Modal>
   </>
  );
};

export default CreateTemplateConfirmModal;