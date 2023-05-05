import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import { NavDropdown } from 'react-bootstrap';
import ServiceFlowFilterListDropDown from "../components/ServiceFlow/filter/ServiceTaskFilterListDropDown";
import createURLPathMatchExp from "../helper/regExp/pathMatch";
import {MULTITENANCY_ENABLED} from "../constants/constants";
import { fetchFilterList } from '../apiManager/services/bpmTaskServices';


function TaskHead() {
  const dispatch = useDispatch();
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const selectedFilter = useSelector(state => state.bpmTasks.selectedFilter?.name);
  const itemCount = useSelector(state => state.bpmTasks.tasksCount);
  const isTaskListLoading = useSelector(state => state.bpmTasks.isTaskListLoading);
  const count = isTaskListLoading ? "" : itemCount ? `(${itemCount})` : '(0)';
  const location = useLocation();
  const { pathname } = location;
  const baseUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const goToTask = () => {
    dispatch(push(`${baseUrl}task`));
  };

  useEffect(()=>{
    dispatch(fetchFilterList());
  },[itemCount]);

  return (
    <div className="header-container">
    <div className="main-header">
      
        <div
         
          className='head-item padding-right-60'
        >
          <h4 className="application-head"  style={{ fontSize: '21px' }}>
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
                        {`${selectedFilter ? selectedFilter : 'Tasks'} ${" "}`}{count}
                      </>
                    }
                    onClick={goToTask}
                  >
                    <ServiceFlowFilterListDropDown />
                  </NavDropdown>
            </span>
          </h4>
        </div>
        <a href='#' style={{ textDecoration: 'underline' , fontSize: '15px' }} className='py-2'>Create new filter</a>
    </div>
    <hr className="head-rule" />
  </div>
  );
}

export default TaskHead;