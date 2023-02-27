import React from 'react';
import { Modal } from 'react-bootstrap';

const RuleCreateModal = ({showModal,handleModalChange}) => {
  return (
    <div>     
         <Modal show={showModal} size="lg">
    <Modal.Header>
      <div className="d-flex justify-content-between align-items-center w-100">
        <h4>Create Rule</h4>
        <span style={{ cursor: "pointer" }} onClick={handleModalChange}>
          <i className="fa fa-times" aria-hidden="true"></i>
        </span>
      </div>
    </Modal.Header>
    <Modal.Body>
        <h1>hi</h1>
    </Modal.Body>
    <Modal.Footer className="justify-content-end">
       
      <button className="btn btn-primary" onClick={()=>{}}>Submit</button>
    </Modal.Footer>
  </Modal>
  </div>
  );
};

export default RuleCreateModal;