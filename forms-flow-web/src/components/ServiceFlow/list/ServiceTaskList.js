import React, { useEffect, useState} from "react";
import { ListGroup, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {fetchServiceTaskList} from "../../../apiManager/services/bpmTaskServices";
import {
  setBPMTaskLoader
} from "../../../actions/bpmTaskActions";
import Loading from "../../../containers/Loading";
import moment from "moment";
import { getProcessDataFromList,getFormattedDateAndTime } from "../../../apiManager/services/formatterService";
import TaskFilterComponent from "./search/TaskFilterComponent";
import Pagination from "react-js-pagination";
import {push} from "connected-react-router";

const ServiceFlowTaskList = React.memo(() => {
  const taskList = useSelector((state) => state.bpmTasks.tasksList);
  const bpmTaskId = useSelector(state => state.bpmTasks.taskId);
  const isTaskListLoading = useSelector(
    (state) => state.bpmTasks.isTaskListLoading
  );
  const reqData = useSelector((state) => state.bpmTasks.listReqParams);
  const dispatch = useDispatch();
  const processList = useSelector((state) => state.bpmTasks.processList);
  const selectedFilter = useSelector((state) => state.bpmTasks.selectedFilter);
  const [activePage, setCurrentPage] = useState(1);
  const tasksPerPage = 15;
  // Logic for displaying current todos
  const indexOfLastTodo = activePage * tasksPerPage;
  const indexOfFirstTodo = indexOfLastTodo - tasksPerPage;
  const currentTaskList = taskList.slice(indexOfFirstTodo, indexOfLastTodo);

  useEffect(() => {
    if (selectedFilter) {
      dispatch(setBPMTaskLoader(true));
      setCurrentPage(1);
      dispatch(fetchServiceTaskList(selectedFilter.id, reqData));
    }
  }, [dispatch, selectedFilter, reqData]);


  const getTaskDetails = (taskId) => {
    if(taskId!==bpmTaskId){
      dispatch(push(`/task/${taskId}`));
    }
  };
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderTaskList = () => {
    if (taskList.length && selectedFilter) {
      return (
        <>
          {currentTaskList.map((task, index) => (
            <div
              className={`clickable ${
                task?.id === bpmTaskId && "selected"
              }`}
              key={index}
              onClick={() => getTaskDetails(task.id)}
            >
              <Row>
                <div className="col-12">
                  <h5>{task.name}</h5>
                </div>
              </Row>
              <Row className="task-row-2">
                <div className="col-6 pr-0">
                  {getProcessDataFromList(
                    processList,
                    task.processDefinitionId,
                    "name"
                  )}
                </div>
                <div data-title="Task assignee" className="col-6 pr-0 text-right">
                  {task.assignee}
                </div>
              </Row>
              <Row className="task-row-3">
                <Col
                  lg={8}
                  xs={8}
                  sm={8}
                  md={8}
                  xl={8}
                  className="pr-0"
                >
                 <span className="tooltiptext" data-title={task.due?getFormattedDateAndTime(task.due):''}> {task.due ? `Due ${moment(task.due).fromNow()}, ` : ""}{" "}</span>
                 <span className="tooltiptext" data-title={task.followUp?getFormattedDateAndTime(task.followUp):''}> {task.followUp
                    ? `Follow-up ${moment(task.followUp).fromNow()}, `
                    : ""} </span>
                 <span className="tooltiptext" data-title={task.created?getFormattedDateAndTime(task.created):''}>  Created {moment(task.created).fromNow()}</span>
                </Col>
                <Col
                  lg={4}
                  xs={4}
                  sm={4}
                  md={4}
                  xl={4}
                  className="pr-0 text-right tooltips"
                  dat-title="priority"
                >
                  {task.priority}
                </Col>
              </Row>
            </div>
          ))}
          <div className="pagination-wrapper">
            <Pagination
              activePage={activePage}
              itemsCountPerPage={tasksPerPage}
              totalItemsCount={taskList.length}
              pageRangeDisplayed={3}
              onChange={handlePageChange}
              prevPageText="<"
              nextPageText=">"
            />
          </div>
        </>
      );
    } else {
      return (
        <Row className="not-selected mt-2 ml-1">
          <i className="fa fa-info-circle mr-2 mt-1" />
          No task matching filters found.
        </Row>
      );
    }
  };

  return (
    <>
      <ListGroup as="ul" className="service-task-list">
        <TaskFilterComponent totalTasks={isTaskListLoading?0:taskList.length} />
        {isTaskListLoading ? <Loading /> : renderTaskList()}
      </ListGroup>
    </>
  );
});

export default ServiceFlowTaskList;
