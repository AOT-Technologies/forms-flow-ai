import React, { useEffect, useRef, useState } from "react";
import { Row, Col, DropdownButton, Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { fetchServiceTaskList } from "../../../apiManager/services/bpmTaskServices";
import {
  setBPMTaskListActivePage,
  setBPMTaskLoader,
} from "../../../actions/bpmTaskActions";
import Loading from "../../../containers/Loading";
import { useTranslation } from "react-i18next";
import "./../ServiceFlow.scss";
import { getFormattedDateAndTime } from "../../../apiManager/services/formatterService";
import Pagination from "react-js-pagination";
import { push } from "connected-react-router";

import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import TaskHeaderListView from "../details/TaskHeaderListView";
const ServiceTaskListView = React.memo((props) => {
  const { expandedTasks, setExpandedTasks } = props;
  const { t } = useTranslation();
  const taskList = useSelector((state) => state.bpmTasks.tasksList);
  const tasksCount = useSelector((state) => state.bpmTasks.tasksCount);
  const bpmTaskId = useSelector((state) => state.bpmTasks.taskId);
  const isTaskListLoading = useSelector(
    (state) => state.bpmTasks.isTaskListLoading
  );
  const reqData = useSelector((state) => state.bpmTasks.listReqParams);
  const dispatch = useDispatch();
  const selectedFilter = useSelector((state) => state.bpmTasks.selectedFilter);
  const firstResult = useSelector((state) => state.bpmTasks.firstResult);
  const activePage = useSelector((state) => state.bpmTasks.activePage);
  const allTaskVariablesExpanded = useSelector(
    (state) => state.bpmTasks.allTaskVariablesExpand
  );
  const [selectedLimitValue, setSelectedLimitValue] = useState(15);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = useRef(
    MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/"
  );
  const selectedTaskVariables = useSelector(
    (state) => state.bpmTasks.selectedTaskVariables
  );
  const vissibleAttributes = useSelector(
    (state) => state.bpmTasks.vissibleAttributes
  );
  const taskvariables = useSelector(
    (state) => state.bpmTasks.selectedFilter?.variables || []
  );

  const options = [
    { value: "6", label: "6" },
    { value: "12", label: "12" },
    { value: "30", label: "30" },
    { value: tasksCount, label: "All" },
  ];

  const handleLimitChange = (limit) => {
    dispatch(setBPMTaskLoader(true));
    setSelectedLimitValue(limit);
    dispatch(fetchServiceTaskList(reqData, null, firstResult, limit));
  };

  let numberofSubmissionListFrom =
    activePage === 1 ? 1 : (activePage * selectedLimitValue) - selectedLimitValue + 1;

  let numberofSubmissionListTo = activePage === 1 ? selectedLimitValue :
    selectedLimitValue * activePage;

  useEffect(() => {
    if (selectedFilter) {
      dispatch(setBPMTaskLoader(true));
      dispatch(setBPMTaskListActivePage(1));
      dispatch(fetchServiceTaskList(reqData, null, firstResult));
    }
  }, [dispatch, reqData]);

  
  
    const getTaskDetails = (taskId) => {
      dispatch(push(`${redirectUrl.current}task/${taskId}`));
    }; 

  const handlePageChange = (pageNumber) => {
    dispatch(setBPMTaskListActivePage(pageNumber));
    dispatch(setBPMTaskLoader(true));
    let firstResultIndex = (selectedLimitValue * pageNumber) - selectedLimitValue;
    dispatch(
      fetchServiceTaskList(reqData,null,firstResultIndex,selectedLimitValue)
    );
  };
  useEffect(() => {
    // Initialize expandedTasks based on the initial value of allTaskVariablesExpanded
    const updatedExpandedTasks = {};
    if (allTaskVariablesExpanded) {
      taskList.forEach((task) => {
        updatedExpandedTasks[task.id] = allTaskVariablesExpanded;
      });
    }
    setExpandedTasks(updatedExpandedTasks);
  }, [allTaskVariablesExpanded, taskList]);
  //Toggle the expanded state of TaskVariables in single task
  const handleToggleTaskVariable = (taskId) => {
    setExpandedTasks((prevExpandedTasks) => ({
      ...prevExpandedTasks,
      [taskId]: !prevExpandedTasks[taskId],
    }));
  };

  const vissibleAttributesCount = Object.values(
    vissibleAttributes?.taskVisibleAttributes
  )?.filter((value) => value === true).length;

  const adjustTaskAttributes = (variable) => {
     variable = variable?.filter(
      (e) => e.name !== "applicationId" && e.name !== "formName"
    );
    const filteredArray = [...variable?.slice(0, 6 - vissibleAttributesCount)];
    return filteredArray;
   
  };

  const filterAdjustedAttributes = (taskListVariables, adjustedValues) => {
    return taskListVariables?.filter((e) => !adjustedValues.includes(e));
  };

  const renderTaskList = () => {
    if ((tasksCount || taskList.length) && selectedFilter) {
      return (
        <>
          <div className="list-container ">
            {taskList?.map((task, index) => {
              const adjustedValues = adjustTaskAttributes(
                task?._embedded?.variable
              );
              let  taskListAttributes = filterAdjustedAttributes(
                task?._embedded?.variable,
                adjustedValues
              );
              taskListAttributes = taskListAttributes.filter(
                (item) =>
                  item.name !== "applicationId" && item.name !== "formName"
              );

              return (
                <div
                  className={`clickable shadow border rounded  ${
                    task?.id === bpmTaskId && "selected"
                  }`}
                  key={index}
                >
                  <Row className="task-title-container p-2 border-bottom">
                    <Col xs={8}>
                      <h4 className="fw-bold">
                        {task.name} -{" "}
                        {
                          task?._embedded?.variable?.filter(
                            (eachValue) => eachValue.name === "formName"
                          )[0]?.value
                        }
                      </h4>
                    </Col>
                    <Col xs={2} className="ms-auto">
                      <div>
                        <h6>
                          <u
                            onClick={() => getTaskDetails(task.id)}
                            className="fw-normal"
                            style={{ color: "#1a5a96", textDecoration: "none" }}
                          >
                            {t("View Details")}
                          </u>
                        </h6>
                      </div>
                    </Col>
                  </Row>

                  <Row className="mt-4 p-2 justify-content-between task-attr-row">
                    {vissibleAttributes?.taskVisibleAttributes
                      ?.applicationId && (
                      <Col xs={2}>
                        <div className="col-12">
                          <h6 className="fw-bold">{t("Submission ID")}</h6>
                          <h6>
                            {
                              task?._embedded?.variable?.filter(
                                (eachValue) =>
                                  eachValue.name === "applicationId"
                              )[0]?.value
                            }
                          </h6>
                        </div>
                      </Col>
                    )}
                    {vissibleAttributes?.taskVisibleAttributes?.createdDate && (
                      <Col xs={2}>
                        <div className="col-12">
                          <h6 className="fw-bold">{t("Created Date")}</h6>
                          <h6
                            title={
                              task.created
                                ? getFormattedDateAndTime(task.created)
                                : ""
                            }
                          >
                            {moment(task.created).isSame(moment(), "day")
                              ? moment(task.created).fromNow()
                              : task.created.split("T")[0]}
                          </h6>
                        </div>
                      </Col>
                    )}
                    <TaskHeaderListView
                        task={task}
                        taskId={task.id}
                        groupView={false}
                      />
                    {vissibleAttributesCount < 6 &&
                    task?._embedded?.variable?.length > 2
                      ? adjustedValues.map((e, i) => {
                          const data = taskvariables?.find(
                            (variableItem) => variableItem.name === e.name
                          );
                          return (
                            <Col xs={2} key={i}>
                              <div
                                className="col-12"
                                style={{ wordBreak: "break-all" }}
                              >
                                <h6 className="fw-bold">{data?.label}</h6>
                              </div>
                              <div className="d-flex col-12">
                                <h6>
                                  <u className="fw-light text-decoration-none ">
                                    {e?.value}
                                  </u>
                                </h6>
                              </div>
                            </Col>
                          );
                        })
                      : null}

                    
                   

                      {vissibleAttributes?.taskVisibleAttributes?.priority &&
                        <Col xs={1}>
                          <div className="col-12">
                            <h6 className="fw-bold">{t("Priority")}</h6>
                          </div>
                          <div className="d-flex col-12">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-filter-right"
                              viewBox="0 0 16 16"
                            >
                              <path d="M14 10.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 .5-.5zm0-3a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 0 0 1h7a.5.5 0 0 0 .5-.5zm0-3a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0 0 1h11a.5.5 0 0 0 .5-.5z" />
                            </svg>
                            <h6 title={t("Priority")}>
                              <u className="fw-light text-decoration-none">
                                {task.priority}
                              </u>
                            </h6>
                          </div>
                        </Col>
                      }


                    {taskListAttributes?.length >= 1  && (
                      <Col xs={1}>
                        <div
                          className="justify-content-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTaskVariable(task.id);
                          }}
                          title={t("Click for task variables")}
                        >
                          <i
                            className="fa fa-angle-down"
                            style={{
                              transform: `${
                                expandedTasks[task.id]
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)"
                              }`,
                            }}
                            aria-hidden="true"
                          />
                        </div>
                      </Col>
                    )}
                  </Row>
                  {expandedTasks[task.id] &&
                    task?._embedded?.variable?.some(
                      (eachVariable) =>
                        eachVariable.name !== "applicationId" &&
                        eachVariable.name !== "formName" &&
                        selectedTaskVariables[eachVariable.name] === true
                    ) && (
                      <>
                        <hr />
                        <Row className="p-2">
                          {taskListAttributes?.map((eachVariable, index) => {
                            if (
                              eachVariable.name !== "applicationId" &&
                              eachVariable.name !== "formName" &&
                              selectedTaskVariables[eachVariable.name] === true
                            ) {
                              const data = taskvariables?.find(
                                (variableItem) =>
                                  variableItem.name === eachVariable.name
                              );
                              return (
                                <Col xs={2} key={index}>
                                  <div
                                    className="col-12"
                                    style={{ wordBreak: "break-all" }}
                                  >
                                    <h6 className="fw-bold">{data?.label}</h6>
                                  </div>
                                  <div className="d-flex col-12">
                                    <h6>
                                      <u className="fw-light text-decoration-none ">
                                        {eachVariable.value}
                                      </u>
                                    </h6>
                                  </div>
                                </Col>
                              );
                            }
                          })}
                        </Row>
                      </>
                    )}
                </div>
              );
            })}

            <div className="d-flex justify-content-between">
              <div className="ms-2">
                <span>
                  {t("Rows per page")} :
                  <DropdownButton
                    className="ms-2 d-inline"
                    drop="down"
                    variant="secondary"
                    title={selectedLimitValue}
                    style={{ display: "inline" }}
                  >
                    {options.map(({ value, label }, index) => (
                      <Dropdown.Item
                        key={{ index }}
                        type="button"
                        onClick={() => {
                          handleLimitChange(value);
                        }}
                      >
                        {label}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                </span>
                <span className="ms-2 mb-3">
                  {t("Showing")} {numberofSubmissionListFrom} {t("to")}{" "}
                  {numberofSubmissionListTo > tasksCount
                    ? tasksCount
                    : numberofSubmissionListTo}{" "}
                  {t("of")} {tasksCount}
                </span>
              </div>
              <div className="d-flex align-items-center">
                <Pagination
                  activePage={activePage}
                  itemsCountPerPage={selectedLimitValue}
                  totalItemsCount={tasksCount}
                  pageRangeDisplayed={4}
                  itemClass="page-item"
                  linkClass="page-link"
                  onChange={handlePageChange}
                  prevPageText="<"
                  nextPageText=">"
                />
              </div>
            </div>
          </div>
        </>
      );
    } else {
      return (
        <Row className="not-selected mt-2 ms-1">
          <i className="fa fa-info-circle me-2 mt-1" />
          {t("No task matching filters found.")}
        </Row>
      );
    }
  };

  return <>{isTaskListLoading ? <Loading /> : renderTaskList()}</>;
});

export default ServiceTaskListView;
