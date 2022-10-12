import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import { NavDropdown } from 'react-bootstrap';
import ServiceFlowFilterListDropDown from "../components/ServiceFlow/filter/ServiceTaskFilterListDropDown";
import createURLPathMatchExp from "../helper/regExp/pathMatch";
import {MULTITENANCY_ENABLED} from "../constants/constants";


function TaskHead() {
  const dispatch = useDispatch();
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const selectedFilter = useSelector(state => state.bpmTasks.selectedFilter?.name);
  const itemCount = useSelector(state => state.bpmTasks.tasksCount);

  const location = useLocation();
  const { pathname } = location;
  const baseUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const goToTask = () => {
    dispatch(push(`${baseUrl}task`));
  };

  return (
    <div className="header-container">
    <div className="main-header">
      
        <div
         
          className='head-item padding-right-60'
        >
          <h3 className="application-head">
            <span className="application-text mr-5">
                  <NavDropdown
                  className={`main-nav nav-item taskDropdown  ${
                    pathname.match(createURLPathMatchExp("task", baseUrl))
                      ? "active-tab-dropdown"
                      : ""
                  }`}
                    title={
                      <>
                        <i className="fa fa-list fa-lg fa-fw " />
                        {`${selectedFilter ? selectedFilter : 'Tasks'} ${" "}(${itemCount ? itemCount : '0'})`}{" "}
                      </>
                    }
                    onClick={goToTask}
                  >
                    <ServiceFlowFilterListDropDown />
                  </NavDropdown>
            </span>
          </h3>
        </div>
    </div>
    <hr className="head-rule" />
  </div>
  );
}

export default TaskHead;