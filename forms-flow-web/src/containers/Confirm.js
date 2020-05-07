import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export default class extends Component {
  render() {
    const {modalOpen=false,handleModalOpen=false, onYes, onNo, message, yesText = 'Yes', noText = 'No' } = this.props;
    return (
      <>
          <Modal show={modalOpen} onHide={handleModalOpen}>
              <Modal.Header>
                 <Modal.Title>Delete Confirmation</Modal.Title>
              </Modal.Header>
              <Modal.Body>{message}</Modal.Body>
              <Modal.Footer>
              <Button type="button" className="btn btn-danger mr-3" onClick={onYes}>{yesText}</Button>
              <Button type="button" className="btn btn-default" onClick={onNo}>{noText}</Button>
              </Modal.Footer>
          </Modal>
        </>
    )
  }
}
