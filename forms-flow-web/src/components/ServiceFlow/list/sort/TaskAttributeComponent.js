import React from 'react';
import { Row, Col } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';
import ModalTitle from 'react-bootstrap/ModalTitle';
import Form from 'react-bootstrap/Form';

function TaskAttributeComponent({ show, onHide, setCheckboxes, checkboxes }) {
    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCheckboxes({ ...checkboxes, [name]: checked });
    };
    const handleCancel = () => {
        onHide();
        setCheckboxes({
            applicationId: false,
            assignee: false,
            taskTitle: false,
            createdDate: false,
            dueDate: false,
            followUp: false,
            priority: false,
            groups: false
        });
    };
    return (
        <Modal show={show} onHide={onHide}
            className='modal-overlay' size='lg'
            backdrop="static"
        >
            <Modal.Header closeButton className='bg-light'>
                <ModalTitle as={('h3')} >Task Attribute</ModalTitle>
            </Modal.Header>
            <Modal.Body className='p-4'>
                <p>Only selected task attributes will be available on task list view</p>
                <Form>
                    <Row>
                    <Col xs={6} >
                    <Form.Check
                    type="checkbox"
                    label="Application ID"
                    name="applicationId"
                    checked={checkboxes.applicationId}
                    onChange={handleCheckboxChange}
                    className='m-2'
                    />
                    <Form.Check
                    type="checkbox"
                    label="Assignee"
                    name="assignee"
                    checked={checkboxes.assignee}
                    onChange={handleCheckboxChange}
                    className='m-2'
                    />
                    <Form.Check
                        type="checkbox"
                        label="Task Title"
                        name="taskTitle"
                        checked={checkboxes.taskTitle}
                        onChange={handleCheckboxChange}
                        className='m-2'
                    />
                    <Form.Check
                        type="checkbox"
                        label="Created Date"
                        name="createdDate"
                        checked={checkboxes.createdDate}
                        onChange={handleCheckboxChange}
                        className='m-2'
                    />
                    
                    </Col>
                    <Col xs={6} >
                    <Form.Check
                        type="checkbox"
                        label="Due date"
                        name="dueDate"
                        checked={checkboxes.dueDate}
                        onChange={handleCheckboxChange}
                        className='m-2'
                    />    
                    <Form.Check
                    type="checkbox"
                    label="Follow-up date"
                    name="followUp"
                    checked={checkboxes.followUp}
                    onChange={handleCheckboxChange}
                    className='m-2'
                    />
                    <Form.Check
                        type="checkbox"
                        label="Priority"
                        name="priority"
                        checked={checkboxes.priority}
                        onChange={handleCheckboxChange}
                        className='m-2'
                    />
                    <Form.Check
                        type="checkbox"
                        label="Groups"
                        name="groups"
                        checked={checkboxes.groups}
                        onChange={handleCheckboxChange}
                        className='m-2'
                        
                    />
                    
                    </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-secondary" onClick={handleCancel}>
                    Cancel
                </button>
                <button className="btn btn-primary" onClick={onHide}>
                    Insert
                </button>
            </Modal.Footer>
        </Modal>
    );
}


export default TaskAttributeComponent;