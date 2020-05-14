import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export default class extends Component {
  render() {
    const { modalOpen=false, onConfirm, message } = this.props;
    return (
      <>
          <Modal show={modalOpen}>
              <Modal.Header>
                 <Modal.Title>Error</Modal.Title>
              </Modal.Header>
              <Modal.Body>{message}</Modal.Body>
              <Modal.Footer>
              <Button type="button" className="btn btn-default" onClick={onConfirm}>Ok</Button>
              </Modal.Footer>
          </Modal>
        </>
    )
  }
}
