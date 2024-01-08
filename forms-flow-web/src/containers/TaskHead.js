import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import { NavDropdown } from "react-bootstrap";
import ServiceFlowFilterListDropDown from "../components/ServiceFlow/filter/ServiceTaskFilterListDropDown";
 import {MULTITENANCY_ENABLED} from "../constants/constants";
import {setSelectedTaskID, setViewType } from '../actions/bpmTaskActions';
import CreateNewFilterDrawer from "../components/ServiceFlow/list/sort/CreateNewFilter";
import { useTranslation } from "react-i18next"; 
function TaskHead() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const itemCount = useSelector((state) => state.bpmTasks.tasksCount);
  const [filterSelectedForEdit, setFilterSelectedForEdit] = useState(null);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const selectedFilter = useSelector((state) => state.bpmTasks.selectedFilter);
  const viewType = useSelector((state) => state.bpmTasks.viewType);
  const isFilterLoading = useSelector(
    (state) => state.bpmTasks.isFilterLoading
  );

  const isTaskListLoading = useSelector(
    (state) => state.bpmTasks.isTaskListLoading
  );

    const baseUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  const goToTask = () => {
    dispatch(push(`${baseUrl}task`));
  };


  const changeTaskView = (view) => {
    if(viewType !== view){
      dispatch(setSelectedTaskID(null));
      dispatch(setViewType(view));
    }

  };
  
  const filterListLoading = () => {
    return <>{isFilterLoading && <>  {t("Loading...")}</>}</>;
  };

  const count = isTaskListLoading ? "" : `(${itemCount})`;

  return (
    <div>
      <div className="d-flex flex-md-row flex-column  align-items-md-center justify-content-between">
        <div className="d-flex align-items-center">
        <NavDropdown
        className="filter-drop-down"
                title={
                  <span className="h4 fw-bold">
                      <i className="fa fa-list-ul me-2" />
                    {selectedFilter?.name ?  
                    `${selectedFilter?.name} ${count}` : filterListLoading() } 
                  </span>
                }
                onClick={goToTask}
              >
                <ServiceFlowFilterListDropDown
                  selectFilter={setFilterSelectedForEdit}
                  openFilterDrawer={setOpenFilterDrawer}
                />
              </NavDropdown>
              <CreateNewFilterDrawer selectedFilterData = {filterSelectedForEdit} 
        openFilterDrawer = {openFilterDrawer} setOpenFilterDrawer = {setOpenFilterDrawer}
        setFilterSelectedForEdit={setFilterSelectedForEdit}
        />
        </div>
        <div  >
          <button
            type="button"
            className={`btn me-1 ${viewType ? "btn-light" : "btn-secondary active"}`}
            onClick={() => {
              changeTaskView(false);
            }} 
          >
              <i className="fa-solid fa-list me-2"></i>
          
              {t("List View")}
          </button>
          <button
            type="button"
            className={`btn ${viewType ? "btn-secondary active" : "btn-light"}`}
            onClick={() => {
              changeTaskView(true);
            }}
          >
           <i className="fa-regular fa-rectangle-list me-2"></i>
           {t("Card View")}
          </button>
        </div>
      </div>
      <hr   />
    </div>
  );
}

export default TaskHead;
