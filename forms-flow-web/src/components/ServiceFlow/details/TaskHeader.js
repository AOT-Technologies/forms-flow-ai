import React, { useState} from "react";
import { Row, Col } from "react-bootstrap";
import {
  getISODateTime,
  getProcessDataFromList
} from "../../../apiManager/services/formatterService";
import {useDispatch, useSelector} from "react-redux";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import "./../ServiceFlow.scss";
import AddGroupModal from "./AddGroupModal";
import {
  claimBPMTask,
  fetchServiceTaskList,
  getBPMTaskDetail,
  unClaimBPMTask,
  updateBPMTask
} from "../../../apiManager/services/bpmTaskServices";
import {setBPMTaskDetailUpdating} from "../../../actions/bpmTaskActions";

const TaskHeader = ({ task }) => {
  const processList = useSelector((state) => state.bpmTasks.processList);
  const username = useSelector((state) => state.user?.userDetail?.preferred_username || '');
  const selectedFilter=useSelector(state=>state.bpmTasks.selectedFilter);
  const reqData = useSelector(state => state.bpmTasks.filterListSortParams);
  const followUp = task?.followUp ? new Date(task?.followUp):null;
  const due = task?.due ? new Date(task?.due): null;
  const [followUpDate, setFollowUpDate] = useState(followUp);
  const [dueDate, setDueDate] = useState(due);
  const [showModal, setModal] = useState(false);
  const dispatch= useDispatch();

  const onClaim = () => {
    dispatch(setBPMTaskDetailUpdating(true));
    dispatch(claimBPMTask(task?.id,username,(err,response)=>{
      if(!err){
        if(selectedFilter){
          dispatch(getBPMTaskDetail(task.id));
          dispatch(fetchServiceTaskList(selectedFilter.id, reqData));
        }
      }else{
        dispatch(setBPMTaskDetailUpdating(false));
      }
    }));
  }

  const onUnClaimTask = () =>{
    dispatch(setBPMTaskDetailUpdating(true));
    dispatch(unClaimBPMTask(task?.id,(err,response)=>{
      if(!err){
        if(selectedFilter){
          dispatch(getBPMTaskDetail(task?.id));
          dispatch(fetchServiceTaskList(selectedFilter.id, reqData));
        }
      }else{
        dispatch(setBPMTaskDetailUpdating(false));
      }
    }));
  }

  const onFollowUpDateUpdate = (followUpDate)=>{
    setFollowUpDate(followUpDate);
    dispatch(setBPMTaskDetailUpdating(true));
    const updatedTask = {...task, ...{followUp:getISODateTime(followUpDate)}};
    dispatch(updateBPMTask(task?.id,updatedTask,(err,response)=>{
      if(!err){
        dispatch(getBPMTaskDetail(task.id));
        dispatch(fetchServiceTaskList(selectedFilter.id, reqData));
      }else{
        dispatch(setBPMTaskDetailUpdating(false));
      }
    }))
  };

  const onDueDateUpdate = (dueDate)=>{
    setDueDate(dueDate);
    dispatch(setBPMTaskDetailUpdating(true));
    const updatedTask = {...task, ...{due:getISODateTime(dueDate)}};
    dispatch(updateBPMTask(task.id,updatedTask,(err,response)=>{
      if(!err){
        dispatch(getBPMTaskDetail(task.id));
        dispatch(fetchServiceTaskList(selectedFilter.id, reqData));
      }else{
        dispatch(setBPMTaskDetailUpdating(false));
      }
    }))
  };

  const FollowUpDateInput= React.forwardRef(({ value, onClick }, ref) =>{
   return    <div onClick={onClick} ref={ref}>
      <i className="fa fa-calendar" />{" "}
      {followUpDate
        ? <span className="mr-4">{moment(followUpDate).fromNow()}</span>
        : "Set follow-up Date"}
    </div>
  });

  const DueDateInput=React.forwardRef(({ value, onClick }, ref) =>{
    return    <div onClick={onClick} ref={ref}>
      <i className="fa fa-bell" />{" "}
      {dueDate ? <span className="mr-4">{moment(dueDate).fromNow()}</span> : "Set Due date"}
    </div>
  });

  const getGroups = (groups)=>{
    return groups?.map(group=>group.groupId).join(", ");
  }

  return (
    <>
    <AddGroupModal modalOpen={showModal} onClose={()=>setModal(false)} groups={task?.groups}/>
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
            onChange={onFollowUpDateUpdate}
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
            onChange={onDueDateUpdate}
            showTimeSelect
            isClearable
            shouldCloseOnSelect
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
        <Col className="center-position" onClick={()=>setModal(true)} title={"groups"}>
          <i className="fa fa-group mr-1"/>
          { task?.groups.length === 0? <span>Add groups</span>:<span>{getGroups(task?.groups)}</span>}
        </Col>
        <Col className="right-side">
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
