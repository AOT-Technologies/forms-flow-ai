import React, { useEffect, useRef,useState } from "react";
import { Row, Col, DropdownButton, Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchServiceTaskList } from "../../../apiManager/services/bpmTaskServices";
import {
  setBPMTaskListActivePage,
  setBPMTaskLoader,
} from "../../../actions/bpmTaskActions";
import Loading from "../../../containers/Loading";
import { useTranslation } from "react-i18next";

import TaskSearchBarListView from "./search/TaskSearchBarListView";

import Pagination from "react-js-pagination";
import { push } from "connected-react-router";
import { MAX_RESULTS } from "../constants/taskConstants";
import { getFirstResultIndex } from "../../../apiManager/services/taskSearchParamsFormatterService";

import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import TaskHeaderListView from "../details/TaskHeaderListView";
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
  const selectedFilter = useSelector((state) => state.bpmTasks.selectedFilter);
  const activePage = useSelector((state) => state.bpmTasks.activePage);
  const tasksPerPage = MAX_RESULTS;
  const [selectedLimitValue, setSelectedLimitValue] = useState(MAX_RESULTS);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = useRef(
    MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/"
  );
  const selectedTaskVariables = useSelector((state) => state.bpmTasks.selectedTaskVariables);
  const taskvariable = useSelector(
    (state) => state.bpmTasks.selectedFilter?.properties?.variables || []
  );
  
  const getLabelOfSelectedVariable = (variable) => {
    if (variable) return taskvariable.find(item => item?.name === variable)?.label;
 
  };
  const options = [
    { value: '6', label: '6' },
    { value: '12', label: '12' },
    { value: '30', label: '30' },
    { value: tasksCount, label: 'All' }
  ];
  const handleLimitChange = (limit) => {
    setSelectedLimitValue(limit);
    dispatch(fetchServiceTaskList(selectedFilter.id,15,reqData,null,limit));
  };
  let numberofSubmissionListFrom =
    activePage === 1 ? 1 : (activePage * selectedLimitValue) - selectedLimitValue + 1;
  let numberofSubmissionListTo = activePage === 1 ? selectedLimitValue :
    selectedLimitValue * activePage;


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

  const handleViewDetails = (taskId) => {
    getTaskDetails(taskId);
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
    if ((tasksCount || taskList.length) && selectedFilter) {
      return (
        <>
        <hr className=" head-rule"/>
        <div className="container list-container p-2"
        style={{ maxHeight: "60vh" }}
        >
          {taskList.map((task, index) => (
            <div
              className={`clickable shadow border  ${
                task?.id === bpmTaskId && "selected"
              }`}
              key={index}
            >
              
              <Row className="mt-4 justify-content-between">
                <Col  xs={2}>
                  <div className="col-12">
                    <h4 className="font-weight-bold">{task.name}</h4>
                  </div>
                  <div className="col-12" style={{ paddingTop: "1rem" }}>
                    <h6 className="font-weight-light">Application Id#{task?._embedded?.variable?.filter((eachValue)=>eachValue.name === "applicationId")[0]?.value}</h6>
                  </div>
                </Col>
                <Col  xs={2} >
                  <div className="col-12 ">
                    <h6 className="font-weight-light">Priority</h6>
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
                    <h6>
                      <u className="font-weight-bold ">{task.priority}</u>
                    </h6>
                  </div>
                </Col>
                <Col  xs={6} className="px-0">
                <TaskHeaderListView task={task} taskId={task.id} groupView = {false} />
                </Col>
                <Col  xs={2}>
                  <div className="col-12 mt-3">
                    <h6>
                      <u
                        onClick={() => handleViewDetails(task.id)}
                        className="font-weight-normal" style={{ color: "#1a5a96",textDecoration:'none' }}>View Details</u>
                    </h6>
                  </div>
                  </Col>
              </Row>
              <Row style={{ marginTop: "-2rem",marginLeft:"16%" }}>

                  {task?._embedded?.variable?.map((eachVariable, index) => {
                    if ( eachVariable.name !== "applicationId" && selectedTaskVariables[eachVariable.name] === true) {
                      return (
                        <Col xs={2} key={index} className="px-0">
                          <div className="col-12" style={{ wordBreak: "break-all" }}>
                            <h6 className="font-weight-light">{getLabelOfSelectedVariable(eachVariable.name)}</h6>
                          </div>
                          <div className="d-flex col-12">
                            <h6>
                              <u className="font-weight-bold text-decoration-none ">{eachVariable.value}</u>
                            </h6>
                          </div>
                        </Col>
                      );
                    }
                  })}
              </Row>
            </div>
          ))}
           
            <div className="d-flex justify-content-between">
              <div className="ml-2">
                  <span>
                    Rows per Page :
                  <DropdownButton
                    className="ml-2"
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
                <span className="ml-2 mb-3">
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
                itemsCountPerPage={tasksPerPage}
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
        <Row className="not-selected mt-2 ml-1">
          <i className="fa fa-info-circle mr-2 mt-1" />
          {t("No task matching filters found.")}
        </Row>
      );
    }
  };

  return (
    <>
        <TaskSearchBarListView />
        {isTaskListLoading ? <Loading /> : renderTaskList()}
    </>
  );
});

export default ServiceTaskListView;
