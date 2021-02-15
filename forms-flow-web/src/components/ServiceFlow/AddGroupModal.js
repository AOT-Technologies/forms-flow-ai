import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Col, Row } from 'react-bootstrap';

export default class extends Component {
  render() {
    const { modalOpen=false, onClose } = this.props;
    return (
      <>
          <Modal show={modalOpen}>
              <Modal.Header>
                 <Modal.Title>Manage Groups</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="modal-text">
                <i className="fa fa-info-circle mr-2"/>
                  You can add a group by typing a group ID into the input field and afterwards clicking the button with the plus sign.
                </div>
                <Row className="mt-3 mb-3">
                  <Col lg={4} xs={12} sm={4} md={4} xl={4} className="text-right">
                    <label className="add">
                      Add a group
                    <i className="fa fa-plus ml-1 mt-1"/>
                    </label>
                  </Col>
                  <Col lg={8} xs={12} sm={8} md={8} xl={8}>
                    <input type="text" placeholder="Group ID" className="add text-color"/>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
              <Button type="button" className="btn btn-default" onClick={onClose}>Close</Button>
              </Modal.Footer>
          </Modal>
        </>
    )
  }
}
