import React, {useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Col, Row } from 'react-bootstrap';
import {useDispatch, useSelector} from "react-redux";
import {addBPMGroup, getBPMGroups, removeBPMGroup} from "../../../apiManager/services/bpmTaskServices";
import {setBPMTaskGroupsLoading} from "../../../actions/bpmTaskActions";
import LoadingOverlay from "react-loading-overlay";

const AddGroupModal= React.memo((props)=> {
    const { modalOpen=false, onClose , groups} = props;
    const taskId = useSelector((state) => state.bpmTasks.taskId);
    const isGroupLoading = useSelector((state) => state.bpmTasks.isGroupLoading);
    const [groupToAdd,updateGroupToAdd] = useState("");
    const dispatch= useDispatch();

    const onDeleteGroup = (group) => {
      dispatch(setBPMTaskGroupsLoading(true));
      dispatch(removeBPMGroup(taskId,group,(err,res)=>{
        if(!err){
          dispatch(getBPMGroups(taskId));
        }else{
          dispatch(setBPMTaskGroupsLoading(false));
        }
      }));
    };

    const onAddGroup = () => {
      dispatch(setBPMTaskGroupsLoading(true));
      const group = {groupId: groupToAdd, type: "candidate"};
      dispatch(addBPMGroup(taskId,group,(err,res)=>{
        if(!err){
          dispatch(getBPMGroups(taskId));
          updateGroupToAdd("");
        }else{
          dispatch(setBPMTaskGroupsLoading(false));
        }
      }));
    };

    return (
      <>
          <Modal show={modalOpen} onHide={onClose}>
              <Modal.Header>
                 <Modal.Title>Manage Groups</Modal.Title>
              </Modal.Header>
            <LoadingOverlay
              active={isGroupLoading}
              spinner
              text="Loading..."
            >
              <Modal.Body>

                <div className="modal-text">
                <i className="fa fa-info-circle mr-2"/>
                  You can add a group by typing a group ID into the input field and afterwards clicking the button with the plus sign.
                </div>
                <Row className="mt-2 mb-1">
                  <Col lg={4} xs={12} sm={4} md={4} xl={4} className="text-right">
                    <button className="add btn btn-link" onClick={onAddGroup} disabled={!groupToAdd}>
                      <span>Add a group</span>
                      <span className="ml-2"><i className="fa fa-plus fa-lg"/></span>
                    </button>
                  </Col>
                  <Col lg={8} xs={12} sm={8} md={8} xl={8}>
                    <input type="text" placeholder="Group ID" data-testid="Group ID" className="add text-color" value={groupToAdd} onChange={(e)=>updateGroupToAdd(e.target.value)}/>
                  </Col>
                </Row>
                <Row className="mb-2 modal-scroll">
                  {groups?.length?
                    <Col lg={{ span: 8, offset: 4 }} xs={12} sm={{ span: 8, offset: 4 }} md={{ span: 8, offset: 4 }} xl={{ span: 8, offset: 4 }} >
                      {groups.map((group,index)=>
                        <div className="mt-1" key={index}>
                          <i className="fa fa-times mr-2 click-element text-blue" data-testid="remove-btn" onClick={()=>onDeleteGroup(group)}/>
                          <span className="word-break">{group.groupId}</span>
                        </div>
                      )}
                  </Col>:null}
                </Row>
              </Modal.Body>
            </LoadingOverlay>
              <Modal.Footer>
              <Button type="button" className="btn btn-default" onClick={onClose}>Close</Button>
              </Modal.Footer>
          </Modal>
        </>
    )
});

export default AddGroupModal;
