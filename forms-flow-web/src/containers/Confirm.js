import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';


const Confirm = React.memo((props)=>{
    const { modalOpen=false, onYes, onNo, message, yesText = 'Yes', noText = 'No' } = props;
    return (
      <>
          <Modal show={modalOpen}>
              <Modal.Header>
                 <Modal.Title>Delete Confirmation</Modal.Title>
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
