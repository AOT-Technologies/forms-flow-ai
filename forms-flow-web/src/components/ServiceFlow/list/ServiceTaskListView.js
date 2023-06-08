import React, { useEffect, useRef } from "react";
import { ListGroup, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchServiceTaskList } from "../../../apiManager/services/bpmTaskServices";
import {
  setBPMTaskListActivePage,
  setBPMTaskLoader,
} from "../../../actions/bpmTaskActions";
import Loading from "../../../containers/Loading";
import { useTranslation } from "react-i18next";
import moment from "moment";
import {
  getProcessDataObjectFromList,
  getFormattedDateAndTime,
} from "../../../apiManager/services/formatterService";
import TaskFilterComponent from "./search/TaskFilterComponent";
import Pagination from "react-js-pagination";
import { push } from "connected-react-router";
import { MAX_RESULTS } from "../constants/taskConstants";
import { getFirstResultIndex } from "../../../apiManager/services/taskSearchParamsFormatterService";
import TaskVariable from "./TaskVariable";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
const ServiceTaskListView = React.memo(() => {
  const { t } = useTranslation();
  const taskList = useSelector((state) => state.bpmTasks.tasksList);
  const tasksCount = useSelector((state) => state.bpmTasks.tasksCount);
  const bpmTaskId = useSelector((state) => state.bpmTasks.taskId);
  const isTaskListLoading = useSelector(
    (state) => state.bpmTasks.isTaskListLoading
  );
  const reqData = useSelector((state) => state.bpmTasks.listReqParams);
  const dispatch = useDispatch();
  const processList = useSelector((state) => state.bpmTasks.processList);
  const selectedFilter = useSelector((state) => state.bpmTasks.selectedFilter);
  const activePage = useSelector((state) => state.bpmTasks.activePage);
  const tasksPerPage = MAX_RESULTS;
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = useRef(
    MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/"
  );

  useEffect(() => {
    if (selectedFilter) {
      dispatch(setBPMTaskLoader(true));
      dispatch(setBPMTaskListActivePage(1));
      dispatch(fetchServiceTaskList(selectedFilter.id, 0, reqData));
    }
  }, [dispatch, selectedFilter, reqData]);

  const getTaskDetails = (taskId) => {
    if (taskId !== bpmTaskId) {
      dispatch(push(`${redirectUrl.current}task/${taskId}`));
    }
  };

  const handlePageChange = (pageNumber) => {
    dispatch(setBPMTaskListActivePage(pageNumber));
    dispatch(setBPMTaskLoader(true));
    let firstResultIndex = getFirstResultIndex(pageNumber);
    dispatch(
      fetchServiceTaskList(selectedFilter.id, firstResultIndex, reqData)
    );
  };

  const renderTaskList = () => {
    console.log(taskList);
    if ((tasksCount || taskList.length) && selectedFilter) {
      return (
        <>
          {taskList.map((task, index) => (
            <div
              className={`clickable shadow border  ${
                task?.id === bpmTaskId && "selected"
              }`}
              key={index}
            >
              <Row className="p-6">
                <Col md={4}>
                  <div className="col-12">
                    <h4 className="font-weight-bold">{task.name}</h4>
                  </div>
                  <div className="col-12" style={{ paddingTop: "1rem" }}>
                    <h6 className="font-weight-light">{task.id}</h6>
                  </div>
                </Col>
                <Col md={1}>
                  <div className="col-12">
                    <h6 className="font-weight-light">Priority</h6>
                  </div>
                  <div className="d-flex col-12">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-filter-right"
                      viewBox="0 0 16 16"
                    >
                      <path d="M14 10.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 .5-.5zm0-3a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 0 0 1h7a.5.5 0 0 0 .5-.5zm0-3a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0 0 1h11a.5.5 0 0 0 .5-.5z" />
                    </svg>
                    <h6>
                      <u className="font-weight-bold p-2">{task.priority}</u>
                    </h6>
                  </div>
                </Col>
                <Col md={1}>
                  <div className="col-12">
                    <h6 className="font-weight-light">Follow Date</h6>
                  </div>
                  <div className="d-flex col-12">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-calendar"
                      viewBox="0 0 16 16"
                    >
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                    </svg>
                    <h6>
                      <u className="font-weight-bold p-2">Add Date</u>
                    </h6>
                  </div>
                </Col>
                <Col md={1}>
                  <div className="col-12">
                    <h6 className="font-weight-light">Due Date</h6>
                  </div>
                  <div className="d-flex col-12">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-calendar"
                      viewBox="0 0 16 16"
                    >
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                    </svg>
                    <h6>
                      <u className="font-weight-bold p-2">Add Date</u>
                    </h6>
                  </div>
                </Col>
                <Col md={1}>
                  <div className="col-12">
                    <h6 className="font-weight-light">Groups</h6>
                  </div>
                  <div className="d-flex col-12">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-people"
                      viewBox="0 0 16 16"
                    >
                      <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                    </svg>
                    <h6>
                      <u className="font-weight-bold p-2">Add Group</u>
                    </h6>
                  </div>
                </Col>
                <Col md={1}>
                  <div className="col-12">
                    <h6 className="font-weight-light">Assigne</h6>
                  </div>
                  <div className="d-flex col-12">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-person-circle"
                      viewBox="0 0 16 16"
                    >
                      <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                      <path
                        fill-rule="evenodd"
                        d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
                      />
                    </svg>
                    <h6>
                      <u className="font-weight-bold p-2">{task.assignee}</u>
                    </h6>
                  </div>
                </Col>
                <Col md={2}>
                  <div className="col-12" style={{ paddingTop: "1rem" }}>
                    <h6>
                      <u className="font-weight-light">View Details</u>
                    </h6>
                  </div>
                </Col>
              </Row>
            </div>
          ))}

          <Row style={{ justifyContent: "flex-end" }}>
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
          </Row>
        </>
      );
    } else {
      return (
        <Row className="not-selected mt-2 ml-1">
          <i className="fa fa-info-circle mr-2 mt-1" />
          {t("No task matching filters found.")}
        </Row>
      );
    }
  };

  return (
    <>
      <ListGroup className="service-task-list">
        <TaskFilterComponent totalTasks={isTaskListLoading ? 0 : tasksCount} />
        {isTaskListLoading ? <Loading /> : renderTaskList()}
      </ListGroup>
    </>
  );
});

export default ServiceTaskListView;
