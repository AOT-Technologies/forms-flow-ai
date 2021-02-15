import React, {useEffect} from "react";
import {ListGroup,Row, Col } from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {fetchServiceTaskList} from "../../apiManager/services/bpmTaskServices";
import {setBPMTaskLoader} from "../../actions/bpmTaskActions";
import Loading from "../../containers/Loading";
import {push} from "connected-react-router";
import moment from "moment";
import {
  getProcessDataFromList,
} from "../../apiManager/services/formatterService";

const ServiceFlowTaskList = () => {
  const taskList = useSelector(state => state.bpmTasks.tasksList);
  const isTaskListLoading = useSelector(state => state.bpmTasks.isTaskListLoading);
  const dispatch= useDispatch();
  const processList = useSelector(state=>state.bpmTasks.processList);
  let selectedTask = useSelector(state=>state.bpmTasks.taskDetail);

  useEffect(()=>{
    dispatch(setBPMTaskLoader(true))
    dispatch(fetchServiceTaskList());
  },[dispatch]);


  const getTaskDetails = (bpmTaskId) =>{
    dispatch(push(`/service-flow-task/${bpmTaskId}`));
  }

  const renderTaskList = () =>{
    if (taskList.length) {
      return (
        <>
        <div className="filter-container">
          <input type="text" className="filter" placeholder="Filter Tasks"/>
          {taskList.length}
        </div>
          {taskList.map((task,index)=> (
              <div className={`clickable ${task?.id === selectedTask?.id && "selected"}` } key={index} onClick={()=>getTaskDetails(task.id)}>
                <Row>
                  <div className="col-12">
                    <h5>
                      {task.name}
                    </h5>
                  </div>
                </Row>
                <Row className="task-row-2">
                  <div className="col-6 pr-0">
                    {getProcessDataFromList(processList, task.processDefinitionId,'name')}
                  </div>
                  <div title="Task assignee" className="col-6 pr-0 text-right">
                    {task.assignee}
                  </div>
                </Row>
                <Row className="task-row-3">
                  <Col lg={8} xs={8} sm={8} md={8} xl={8} className="pr-0" title={task.created}>
                    {task.due? `Due in ${moment(task.due).fromNow()}, `:''} {task.followUp? `Follow-up in ${moment(task.followUp).fromNow()}, `:''}Created {moment(task.created).fromNow()}
                  </Col>
                  <Col lg={4} xs={4} sm={4} md={4} xl={4} className="pr-0 text-right" title="priority">
                    {task.priority}
                  </Col>
                </Row>
              </div>
            )
          )}
        </>
      )
    } else {
      return (<ListGroup.Item> No tasks Found</ListGroup.Item>)
    }
  }

  return  <>
    <ListGroup as="ul" className="service-task-list">
      {isTaskListLoading? <Loading/>: renderTaskList()}
    </ListGroup>
    </>
};

export default ServiceFlowTaskList;
