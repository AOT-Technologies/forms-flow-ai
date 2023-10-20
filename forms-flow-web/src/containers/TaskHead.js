import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { push } from "connected-react-router";
import { NavDropdown } from "react-bootstrap";
import ServiceFlowFilterListDropDown from "../components/ServiceFlow/filter/ServiceTaskFilterListDropDown";
import createURLPathMatchExp from "../helper/regExp/pathMatch";
import {MULTITENANCY_ENABLED} from "../constants/constants";
import {setViewType } from '../actions/bpmTaskActions';
import CreateNewFilterDrawer from "../components/ServiceFlow/list/sort/CreateNewFilter";

function TaskHead() {
  const dispatch = useDispatch();
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const itemCount = useSelector(state => state.bpmTasks.tasksCount);
  const [filterSelectedForEdit,setFilterSelectedForEdit] = useState(null);
  const [openFilterDrawer,setOpenFilterDrawer] = useState(false);
  const selectedFilter = useSelector(
    (state) => state.bpmTasks.selectedFilter
  );

  const isFilterLoading = useSelector(
    (state) => state.bpmTasks.isFilterLoading
  );

  const isTaskListLoading = useSelector(
    (state) => state.bpmTasks.isTaskListLoading
  );

  const location = useLocation();
  const { pathname } = location;
  const baseUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  const goToTask = () => {
    dispatch(push(`${baseUrl}task`));
  };
  const viewType = useSelector(
    (state) => state.bpmTasks.viewType
  );

  const changeTaskView = (view) => {
    dispatch(setViewType(view));
  };

  const filterListLoading = ()=>{
    return (
      <>
        { isFilterLoading && (
          <>
          Loading...
          </>
        ) }
      </>
    );
  };

  const count = isTaskListLoading ? "" : `(${itemCount})`;

  return (
    <div className="header-container">
      <div className="main-header">
        <div className="head-item padding-right-60">
          <h4 className="application-head" style={{ fontSize: "21px" }}>
            <span className="application-text mr-2  ">
              <NavDropdown
                className={`main-nav nav-item taskDropdown  ${
                  pathname.match(createURLPathMatchExp("task", baseUrl))
                    ? "active-tab-dropdown"
                    : ""
                }`}
                title={
                  <>
                    <i className="fa fa-list-ul px-2" />
                    {selectedFilter ?  `${selectedFilter?.name} ${count}` : filterListLoading() }
                  </>
                }
                onClick={goToTask}
              >
                <ServiceFlowFilterListDropDown selectFilter = {setFilterSelectedForEdit} 
                openFilterDrawer = {setOpenFilterDrawer}/>
              </NavDropdown>
            </span>
          </h4>
        </div>
        
        <CreateNewFilterDrawer selectedFilterData = {filterSelectedForEdit} 
        openFilterDrawer = {openFilterDrawer} setOpenFilterDrawer = {setOpenFilterDrawer}
        setFilterSelectedForEdit={setFilterSelectedForEdit}
        /> 
        <div style={{ marginLeft: "auto", marginRight: "3rem" }}>
          <button
            type="button"
            className={`btn ${viewType ? "btn-light" : "btn-secondary"} ${viewType ? "" : "active"
              }`}
            onClick={() => {
              changeTaskView(false);
            }}
            style={{ marginRight: "2px" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-list-task mr-2"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M2 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5H2zM3 3H2v1h1V3z"
              />
              <path d="M5 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM5.5 7a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9zm0 4a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9z" />
              <path
                fillRule="evenodd"
                d="M1.5 7a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5V7zM2 7h1v1H2V7zm0 3.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H2zm1 .5H2v1h1v-1z"
              />
            </svg>
            List View
          </button>
          <button
            type="button"
            className={`btn ${viewType ? "btn-secondary" : "btn-light"} ${viewType ? "active" : ""
              }`}
            onClick={() => {
              changeTaskView(true);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-card-list mr-2"
              viewBox="0 0 16 16"
            >
              <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z" />
              <path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8zm0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM4 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
            </svg>
            Card View
          </button>
        </div>

      </div>
      <hr className="head-rule" />
    </div>
  );
  
}

export default TaskHead;
