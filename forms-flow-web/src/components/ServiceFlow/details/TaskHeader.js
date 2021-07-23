import React, {useEffect, useState} from "react";
import { Row, Col } from "react-bootstrap";
import {
  getISODateTime,
  getProcessDataFromList,
  getFormattedDateAndTime
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
  unClaimBPMTask, updateAssigneeBPMTask,
  updateBPMTask
} from "../../../apiManager/services/bpmTaskServices";
import {setBPMTaskDetailUpdating} from "../../../actions/bpmTaskActions";
//import UserSelection from "./UserSelection";
import UserSelectionDebounce from "./UserSelectionDebounce";
import SocketIOService from "../../../services/SocketIOService";

const TaskHeader = React.memo(() => {
  const task = useSelector(state => state.bpmTasks.taskDetail);
  const taskId = useSelector((state) => state.bpmTasks.taskId);
  const processList = useSelector((state) => state.bpmTasks.processList);
  const username = useSelector((state) => state.user?.userDetail?.preferred_username || '');
  const taskGroups = useSelector(state=>state.bpmTasks.taskGroups);
  const selectedFilter=useSelector(state=>state.bpmTasks.selectedFilter);
  const reqData = useSelector(state => state.bpmTasks.listReqParams);
  const [followUpDate, setFollowUpDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [showModal, setModal] = useState(false);
  const [isEditAssignee, setIsEditAssignee]=useState(false);
  const dispatch= useDispatch();

  useEffect(()=>{
    const followUp= task?.followUp ? new Date(task?.followUp):null;
    setFollowUpDate(followUp);
  },[task?.followUp])

  useEffect(()=>{
    const due= task?.due ? new Date(task?.due): null;
    setDueDate(due);
  },[task?.due]);

  const onClaim = () => {
    dispatch(setBPMTaskDetailUpdating(true));
    dispatch(claimBPMTask(taskId,username,(err,response)=>{
      if(!err){
        if(!SocketIOService.isConnected()){
          if(selectedFilter){
            dispatch(getBPMTaskDetail(taskId));
            dispatch(fetchServiceTaskList(selectedFilter.id, reqData));
          }else{
            dispatch(setBPMTaskDetailUpdating(false));
          }
        }
      }else{
        dispatch(setBPMTaskDetailUpdating(false));
      }
    }));
  }
  const onChangeClaim = (userId) => {
    setIsEditAssignee(false);
   if(userId && userId!==task.assignee){
     dispatch(setBPMTaskDetailUpdating(true));
     dispatch(updateAssigneeBPMTask(taskId,userId,(err,response)=>{
       if(!err){
         if(!SocketIOService.isConnected()){
         if(selectedFilter){
           dispatch(getBPMTaskDetail(taskId));
           dispatch(fetchServiceTaskList(selectedFilter.id, reqData));
         }
         }
       }else{
         dispatch(setBPMTaskDetailUpdating(false));
       }
     }));
   }
  }

  const onUnClaimTask = () =>{
    dispatch(setBPMTaskDetailUpdating(true));
    dispatch(unClaimBPMTask(taskId,(err,response)=>{
      if(!err){
        if(!SocketIOService.isConnected()){
        if(selectedFilter){
          dispatch(getBPMTaskDetail(taskId));
          dispatch(fetchServiceTaskList(selectedFilter.id, reqData));
        }
        }
      }else{
        dispatch(setBPMTaskDetailUpdating(false));
      }
    }));
  }

  const onFollowUpDateUpdate = (followUpDate)=>{
    setFollowUpDate(followUpDate);
    dispatch(setBPMTaskDetailUpdating(true));
    const updatedTask = {...task, ...{followUp:followUpDate?getISODateTime(followUpDate):null}};
    dispatch(updateBPMTask(taskId,updatedTask,(err,response)=>{
      if(!err){
        if(!SocketIOService.isConnected()) {
          dispatch(getBPMTaskDetail(taskId));
          dispatch(fetchServiceTaskList(selectedFilter.id, reqData));
        }
      }else{
        dispatch(setBPMTaskDetailUpdating(false));
      }
    }))
  };

  const onDueDateUpdate = (dueDate)=>{
    setDueDate(dueDate);
    dispatch(setBPMTaskDetailUpdating(true));
    const updatedTask = {...task, ...{due:dueDate?getISODateTime(dueDate):null}};
    dispatch(updateBPMTask(taskId,updatedTask,(err,response)=>{
      if(!err){
        if(!SocketIOService.isConnected()) {
          dispatch(getBPMTaskDetail(taskId));
          dispatch(fetchServiceTaskList(selectedFilter.id, reqData));
        }
      }else{
        dispatch(setBPMTaskDetailUpdating(false));
      }
    }))
  };

  const FollowUpDateInput= React.forwardRef(({ value, onClick }, ref) =>{
   return    <div onClick={onClick} ref={ref}>
      <i className="fa fa-calendar mr-1"/>{" "}
      {followUpDate
        ? <span className="mr-4">{moment(followUpDate).fromNow()}</span>
        : "Set follow-up Date"}
    </div>
  });



  const DueDateInput=React.forwardRef(({ value, onClick }, ref) =>{
    return    <div onClick={onClick} ref={ref}>
     <i className="fa fa-bell mr-1"/>{" "}
      {dueDate ? <span className="mr-4">{moment(dueDate).fromNow()}</span> : "Set Due date"}
    </div>
  });

  const getGroups = (groups)=>{
    return groups?.map(group=>group.groupId).join(", ");
  }

  return (
    <>
    <AddGroupModal modalOpen={showModal} onClose={()=>setModal(false)} groups={taskGroups}/>
      <Row className="ml-0 task-header">{task?.name}</Row>
      <Row className="ml-0 task-name" >
      <span className="application-id" dat-title={"Process Name"}> {getProcessDataFromList(processList, task?.processDefinitionId, "name")}</span>
      </Row>
      <Row className="ml-0" >
      <span data-title="Application Id" className="application-id"> Application ID# {task?.applicationId}</span>
      </Row>
      <Row className="actionable mb-4">
        <Col sm={followUpDate?2:"auto"} data-title={followUpDate?getFormattedDateAndTime(followUpDate):'Set FollowUp Date'} className='date-container'>
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
        <Col sm={dueDate?2:"auto"} data-title={dueDate?getFormattedDateAndTime(dueDate):'Set Due Date'} className='date-container'>
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
        <Col className="center-position" sm={4} onClick={()=>setModal(true)} dat-title={"groups"}>
          <i className="fa fa-group mr-1"/>
          { taskGroups.length === 0? <span>Add groups</span>:<span className="group-align">{getGroups(taskGroups)}</span>}
        </Col>
        <Col className="right-side">
          {isEditAssignee?(task?.assignee? <span>
              <UserSelectionDebounce onClose={()=>setIsEditAssignee(false)}
                             currentUser={task.assignee}
                             onChangeClaim={onChangeClaim}/></span>:
            <span onClick={onClaim}> Claim</span>):
            (<>
          <i className="fa fa-user mr-1" />
          {task?.assignee ? (<span>
              <span className="change-tooltip" onClick={()=>setIsEditAssignee(true)} dat-title="Click to Change Assignee">{task.assignee}</span>
              <i className="fa fa-times ml-1" onClick={onUnClaimTask} dat-title="Reset Assignee"/></span>) :
              <span onClick={onClaim}> Claim</span>
            }
            </>)
          }
        </Col>
      </Row>
    </>
  );
});

export default TaskHeader;
