import React from 'react';
import Modal from "react-bootstrap/Modal";
 
const FormListModal = ({showModal,}) => {
  return (
    <div>
        <Modal show={showModal}  >
        <Modal.Header>
          <Modal.Title>
                <h3>Select Form</h3>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
         
        </Modal.Body>
        <Modal.Footer>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FormListModal;