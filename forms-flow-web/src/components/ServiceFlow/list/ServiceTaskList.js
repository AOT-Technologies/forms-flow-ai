import React, { useEffect } from "react";
import { ListGroup, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {fetchServiceTaskList, fetchServiceTaskListCount} from "../../../apiManager/services/bpmTaskServices";
import {
  setBPMTaskListActivePage,
  setBPMTaskLoader
} from "../../../actions/bpmTaskActions";
import Loading from "../../../containers/Loading";
import { Trans , useTranslation} from "react-i18next";
import moment from "moment";
import { getProcessDataFromList,getFormattedDateAndTime } from "../../../apiManager/services/formatterService";
import TaskFilterComponent from "./search/TaskFilterComponent";
import Pagination from "react-js-pagination";
import {push} from "connected-react-router";
import {MAX_RESULTS} from "../constants/taskConstants";
import {getFirstResultIndex} from "../../../apiManager/services/taskSearchParamsFormatterService";

const ServiceFlowTaskList = React.memo(() => {
  const taskList = useSelector((state) => state.bpmTasks.tasksList);
  const tasksCount = useSelector(state=> state.bpmTasks.tasksCount);
  const bpmTaskId = useSelector(state => state.bpmTasks.taskId);
  const isTaskListLoading = useSelector(
    (state) => state.bpmTasks.isTaskListLoading
  );
  const reqData = useSelector((state) => state.bpmTasks.listReqParams);
  const dispatch = useDispatch();
  const processList = useSelector((state) => state.bpmTasks.processList);
  const selectedFilter = useSelector((state) => state.bpmTasks.selectedFilter);
  const activePage = useSelector(state=>state.bpmTasks.activePage);
  const tasksPerPage = MAX_RESULTS;
  const {t} = useTranslation();
  useEffect(() => {
    if (selectedFilter) {
      dispatch(setBPMTaskLoader(true));
      dispatch(setBPMTaskListActivePage(1));
      dispatch(fetchServiceTaskListCount(selectedFilter.id, reqData))
      dispatch(fetchServiceTaskList(selectedFilter.id, 0, reqData));
    }
  }, [dispatch, selectedFilter, reqData]);

  const getTaskDetails = (taskId) => {
    if(taskId!==bpmTaskId){
      dispatch(push(`/task/${taskId}`));
    }
  };

  const handlePageChange = (pageNumber) => {
    dispatch(setBPMTaskListActivePage(pageNumber));
    dispatch(setBPMTaskLoader(true));
    let firstResultIndex = getFirstResultIndex(pageNumber) ;
    dispatch(fetchServiceTaskListCount(selectedFilter.id, reqData))
    dispatch(fetchServiceTaskList(selectedFilter.id, firstResultIndex, reqData));
  };

  const renderTaskList = () => {
    if ((tasksCount||taskList.length) && selectedFilter) {
      return (
        <>
          {taskList.map((task, index) => (
            <div
              className={`clickable ${
                task?.id === bpmTaskId && "selected"
              }`}
              key={index}
              onClick={() => getTaskDetails(task.id)}
            >
              <Row>
                <div className="col-12">
                  <h5 className="font-weight-bold">{task.name}</h5>
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
                <div data-title={t("task_assigne")} className="col-6 pr-0 text-right">
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
                 <span className="tooltiptext" data-title={task.due?getFormattedDateAndTime(task.due):''}> {task.due ? `${t("Due")} ${moment(task.due).fromNow()}, ` : ""}{" "}</span>
                 <span className="tooltiptext" data-title={task.followUp?getFormattedDateAndTime(task.followUp):''}> {task.followUp
                    ? `${t("follow_up")} ${moment(task.followUp).fromNow()}, `
                    : ""} </span>
                 <span className="tooltiptext" data-title={task.created?getFormattedDateAndTime(task.created):''}> <Trans>{"created"}</Trans> {moment(task.created).fromNow()}</span>
                </Col>
                <Col
                  lg={4}
                  xs={4}
                  sm={4}
                  md={4}
                  xl={4}
                  className="pr-0 text-right tooltips"
                  dat-title={t("priority")}
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
              totalItemsCount={tasksCount}
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
         <Trans>{"no_filter"}</Trans>
        </Row>
      );
    }
  };

  return (
    <>
      <ListGroup as="ul" className="service-task-list">
        <TaskFilterComponent totalTasks={isTaskListLoading?0:tasksCount} />
        {isTaskListLoading ? <Loading /> : renderTaskList()}
      </ListGroup>
    </>
  );
});

export default ServiceFlowTaskList;
