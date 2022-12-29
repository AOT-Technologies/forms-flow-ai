import React from 'react';
import { Modal } from 'react-bootstrap';

const CreateTemplateConfirmModal = ({modalOpen,handleModalChange,onConfirm}) => {
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
                Create a duplicate form
              </Modal.Title>
            </div>

            <div>
              <button
                type="button"
                className="close"
                onClick={() => {
                  handleModalChange();
                }}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </Modal.Header>

          <Modal.Body>
            <div className="d-flex align-items-start p-3">
              <i className="fa fa-info-circle text-primary mr-2"></i>
              <span > 
              Do you want to create a duplicate Form and associated workflow
              from existing form data ? 
              </span>
            </div>
    
          </Modal.Body>
          <Modal.Footer>
            <div className='d-flex justify-content-end'>
                <button className='btn btn-danger mr-2' onClick={()=>{handleModalChange();}}>No</button>
                <button className='btn btn-primary' onClick={()=>{onConfirm();}}>Yes</button>
            </div>
          </Modal.Footer>
        </Modal>
   </>
  );
};

export default CreateTemplateConfirmModal;