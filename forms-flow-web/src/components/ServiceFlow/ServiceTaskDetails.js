import React, {useEffect} from "react";
import {Row, Tab, Tabs} from "react-bootstrap";
import {useParams} from "react-router-dom";
import TaskHeader from "./TaskHeader";
import {setBPMTaskDetailLoader} from "../../actions/bpmTaskActions";
import {fetchServiceTaskList, getBPMTaskDetail} from "../../apiManager/services/bpmTaskServices";
import {useDispatch, useSelector} from "react-redux";
import Loading from "../../containers/Loading";
import ProcessDiagram from "../BPMN/ProcessDiagramHook";
import {getFormIdSubmissionIdFromFormURL, getProcessDataFromList} from "../../apiManager/services/formatterService";
import History from "../Application/ApplicationHistory";
import FormEdit from "../Form/Item/Submission/Item/Edit";
import LoadingOverlay from "react-loading-overlay";
import {getForm, getSubmission} from "react-formio";


const ServiceFlowTaskDetails = () => {

  const {bpmTaskId} = useParams();
  const task = useSelector(state => state.bpmTasks.taskDetail);
  const processList = useSelector(state=>state.bpmTasks.processList);
  const isTaskLoading = useSelector(state => state.bpmTasks.isTaskDetailLoading);
  const isTaskUpdating = useSelector(state => state.bpmTasks.isTaskDetailUpdating);
  const dispatch= useDispatch();

  useEffect(()=>{
    if(bpmTaskId){
      dispatch(setBPMTaskDetailLoader(true))
      dispatch(getBPMTaskDetail(bpmTaskId));
    }
  },[bpmTaskId, dispatch]);


  useEffect(()=>{
    if(task?.formUrl){
      const {formId,submissionId} =getFormIdSubmissionIdFromFormURL(task?.formUrl);
      dispatch(getForm('form',formId));
      dispatch(getSubmission('submission', submissionId, formId))
    }
  },[task, dispatch]);

  const onFormSubmitCallback = () => {
    dispatch(setBPMTaskDetailLoader(true))
    dispatch(getBPMTaskDetail(task.id));
    dispatch(fetchServiceTaskList());
  }

   if(!bpmTaskId){
     return <Row className="not-selected mt-2 ml-1">
       <i className="fa fa-info-circle mr-2 mt-1"/>
       Select a task in the list.
       </Row>
   }else if(isTaskLoading) {
   return <div className="service-task-details">
     <Loading/>
   </div>
   }else{
     /*TODO split render*/
     return (<div className="service-task-details">
       <LoadingOverlay
         active={isTaskUpdating}
         spinner
         text="Loading..."
       >
       <TaskHeader task={task}/>
       <Tabs defaultActiveKey="form" id="service-task-details" mountOnEnter>
         <Tab eventKey="form" title="Form">
           <FormEdit onFormSubmit={()=>onFormSubmitCallback()}/>
         </Tab>
         <Tab eventKey="history" title="History">
           <History applicationId={task?.applicationId}/>
         </Tab>
         <Tab eventKey="diagram" title="Diagram">
           <div>
             <ProcessDiagram
               process_key={getProcessDataFromList(processList, task?.processDefinitionId,'key')}
               // markers={processActivityList}
             />
           </div>
         </Tab>
       </Tabs>
       </LoadingOverlay>
     </div>)
   }
};

export default ServiceFlowTaskDetails;
