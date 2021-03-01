import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import {
  getProcessDataFromList
} from "../../../apiManager/services/formatterService";
import {useDispatch, useSelector} from "react-redux";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import AddGroupModal from "./AddGroupModal";
import {
  claimBPMTask,
  fetchServiceTaskList,
  getBPMTaskDetail,
  unClaimBPMTask
} from "../../../apiManager/services/bpmTaskServices";
import {setBPMTaskDetailUpdating} from "../../../actions/bpmTaskActions";

const TaskHeader = ({ task }) => {
  /*if(!task){
  return <div>No task found</div>
}*/
  const processList = useSelector((state) => state.bpmTasks.processList);
  const username = useSelector((state) => state.user?.userDetail?.preferred_username || '');

  const [followUpDate, setFollowUpDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
/*  const [followUp, setFollowUpCalendar] = useState(false);
  const [due, setDueCalendar] = useState(false);*/
  const [showModal, setModal] = useState(false);
  const dispatch= useDispatch();

/*  const handleCalendar = (type) => {
    if (type === "follow-up") {
      setFollowUpCalendar(true);
      setDueCalendar(false);
    } else if (type === "due") {
      setFollowUpCalendar(false);
      setDueCalendar(true);
    } else {
      setFollowUpCalendar(false);
      setDueCalendar(false);
    }
  };*/

  const onClaim = () => {
    dispatch(setBPMTaskDetailUpdating(true));
    dispatch(claimBPMTask(task.id,username,(err,response)=>{
      if(!err){
        dispatch(getBPMTaskDetail(task.id));
        dispatch(fetchServiceTaskList());
      }else{
        dispatch(setBPMTaskDetailUpdating(false));
      }
    }));
  }

  const onUnClaimTask = () =>{
    dispatch(setBPMTaskDetailUpdating(true));
    dispatch(unClaimBPMTask(task.id,(err,response)=>{
      if(!err){
        dispatch(getBPMTaskDetail(task.id));
        dispatch(fetchServiceTaskList());
      }else{
        dispatch(setBPMTaskDetailUpdating(false));
      }
    }));
  }

  const FollowUpDateInput=({onClick})=>{
   return    <div onClick={onClick}>
      <i className="fa fa-calendar" />{" "}
      {followUpDate
        ? <span className="mr-4">{moment(followUpDate).fromNow()}</span>
        : "Set follow-up Date"}
    </div>
  };

  const DueDateInput=({onClick})=>{
    return    <div onClick={onClick}>
      <i className="fa fa-bell" />{" "}
      {dueDate ? <span className="mr-4">{moment(dueDate).fromNow()}</span> : "Set Due date"}
    </div>
  };

  return (
    <>
    <AddGroupModal modalOpen={showModal} onClose={()=>setModal(false)}/>
      <Row className="ml-0 task-header">{task?.name}</Row>
      <Row className="ml-0 task-name" title={"Process Name"}>
        {getProcessDataFromList(processList, task?.processDefinitionId, "name")}
      </Row>
      <Row className="ml-0" title="Process InstanceId">
        Application ID# {task?.applicationId}
      </Row>
      <Row className="actionable">
        <Col>
          <DatePicker
            selected={followUpDate}
            onChange={(date) => setFollowUpDate(date)}
            showTimeSelect
            isClearable
            popperPlacement="bottom-start"
            popperModifiers={{
              offset: {
                enabled: true,
                offset: "5px, 10px"
              },
              preventOverflow: {
                enabled: true,
                escapeWithReference: false,
                boundariesElement: "viewport"
              }
            }}
            customInput={<FollowUpDateInput/>}
          />
        </Col>
        <Col>
          <DatePicker
            selected={dueDate}
            onChange={(date) => setDueDate(date)}
            showTimeSelect
            isClearable
            popperPlacement="bottom-start"
            popperModifiers={{
              offset: {
                enabled: true,
                offset: "5px, 10px"
              },
              preventOverflow: {
                enabled: true,
                escapeWithReference: false,
                boundariesElement: "viewport"
              }
            }}
            customInput={<DueDateInput/>}
          />
        </Col>
        <Col onClick={()=>setModal(true)}>
          <i className="fa fa-group" /> Add groups
        </Col>
        <Col>
          <i className="fa fa-user mr-1" />
          {task?.assignee ? (
            <span>
              {task.assignee}
              <i className="fa fa-times ml-1" onClick={onUnClaimTask}/></span>
          ) : <span onClick={onClaim}> Claim</span>
            }
        </Col>
      </Row>
    </>
  );
};

export default TaskHeader;
